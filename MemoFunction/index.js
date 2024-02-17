const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const containerName = 'memos'; // The name of your Azure Blob Storage container
let blobServiceClient, containerClient;

module.exports = async function (context, req) {
    const keyVaultName = process.env["webbykv"]; // Your Azure Key Vault name
    const KVUri = `https://${keyVaultName}.vault.azure.net`;
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(KVUri, credential);
    const storageConnectionString = await client.getSecret("saconnstring1").then(secret => secret.value);

    blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);

    switch (req.method) {
        case 'GET':
            await getMemos(context, req);
            break;
        case 'POST':
        case 'PUT':
            await createOrUpdateMemo(context, req, req.method === 'PUT');
            break;
        case 'DELETE':
            await deleteMemo(context, req);
            break;
        default:
            context.res = { status: 405, body: "Method not supported" };
    }
};

async function getMemos(context, req) {
    try {
        const listBlobs = containerClient.listBlobsFlat();
        const memos = [];
        for await (const blob of listBlobs) {
            const blobClient = containerClient.getBlobClient(blob.name);
            const downloadBlockBlobResponse = await blobClient.downloadToBuffer();
            let blobContent = JSON.parse(downloadBlockBlobResponse.toString());
            const id = blob.name.replace('.json', ''); // Extract ID from blob name
            blobContent = { ...blobContent, id }; // Include the ID in the blob content
            memos.push(blobContent);
            context.log(`Successfully fetched memo: ${blob.name}`);
        }
        // Additional logging to inspect the content right before sending the response
        context.log(`Final memos content before sending: ${JSON.stringify(memos)}`);
        context.log(`Total memos fetched: ${memos.length}`);

        context.res = {
            status: memos.length > 0 ? 200 : 204,
            body: memos.length > 0 ? memos : "No memos found.",
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        context.log.error(`Error fetching memos: ${error.message}`);
        context.res = {
            status: 500,
            body: `Error fetching memos: ${error.message}`
        };
    }
}





async function createOrUpdateMemo(context, req, isUpdate = false) {
    const id = req.params.id || (isUpdate ? undefined : new Date().getTime().toString()); // Only generate a new ID if not updating

    if (isUpdate && !id) {
        context.res = { status: 400, body: "Memo ID required for update." };
        return;
    }

    let content = req.body;
    if (!isUpdate) {
        content = { ...content, timestamp: new Date().toISOString() }; // Add timestamp for new memos
    } else {
        content.timestamp = new Date().toISOString(); // Update timestamp for edited memos
    }

    const contentString = JSON.stringify(content);
    const blobName = `${id}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(Buffer.from(contentString), Buffer.byteLength(contentString), { overwrite: true });
    context.res = { status: 200, body: { message: "Memo saved successfully.", id } };
}

async function deleteMemo(context, req) {
    const memoId = req.params.id;
    if (!memoId) {
        context.res = { status: 400, body: "Memo ID required for deletion." };
        return;
    }

    const blobName = `${memoId}.json`;
    const blobClient = containerClient.getBlobClient(blobName);
    const exists = await blobClient.exists();
    if (!exists) {
        context.res = { status: 404, body: "Memo not found." };
        return;
    }

    await blobClient.delete();
    context.res = { status: 200, body: "Memo deleted successfully." };
}
