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
            const blobContent = JSON.parse(downloadBlockBlobResponse.toString());
            memos.push(blobContent);
            context.log(`Memo content: ${JSON.stringify(blobContent)}`); // Additional logging
        }
        context.log(`Total memos fetched: ${memos.length}`); // Log total number of memos
        context.res = {
            status: memos.length > 0 ? 200 : 204,
            body: memos.length > 0 ? memos : [],
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
    const id = req.params.id || new Date().getTime().toString(); // Use timestamp as ID if not provided
    let content = req.body;

    if (!isUpdate) {
        content = {
            ...content,
            timestamp: new Date().toISOString() // Add timestamp for new memos
        };
    }

    const contentString = JSON.stringify(content);
    const blockBlobClient = containerClient.getBlockBlobClient(`${id}.json`);
    await blockBlobClient.upload(Buffer.from(contentString), Buffer.byteLength(contentString), { overwrite: isUpdate });
    context.res = { status: 200, body: { message: "Memo saved successfully.", id } };
}

async function deleteMemo(context, req) {
    if (!req.params.id) {
        context.res = { status: 400, body: "Memo ID required for deletion." };
        return;
    }
    const blobClient = containerClient.getBlobClient(`${req.params.id}.json`);
    await blobClient.delete();
    context.res = { status: 200, body: "Memo deleted successfully." };
}
