const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const containerName = 'memos';
let blobServiceClient, containerClient;

module.exports = async function (context, req) {
    const keyVaultName = process.env["webbykv"];
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
    const listBlobs = containerClient.listBlobsFlat();
    const memos = [];
    for await (const blob of listBlobs) {
        memos.push({ name: blob.name, url: containerClient.getBlobClient(blob.name).url });
    }
    context.res = { status: 200, body: memos };
}

async function createOrUpdateMemo(context, req, isUpdate = false) {
    const id = req.params.id || new Date().getTime().toString(); // Use timestamp as ID if not provided
    const content = req.body;
    const contentString = JSON.stringify(content); // Correctly stringify the content object
    const blockBlobClient = containerClient.getBlockBlobClient(id + ".json");
    await blockBlobClient.upload(Buffer.from(contentString), Buffer.byteLength(contentString), { overwrite: isUpdate });
    context.res = { status: 200, body: { message: "Memo saved successfully.", id: id } };
}

async function deleteMemo(context, req) {
    if (!req.params.id) {
        context.res = { status: 400, body: "Memo ID required for deletion." };
        return;
    }
    const blobClient = containerClient.getBlobClient(req.params.id + ".json");
    await blobClient.delete();
    context.res = { status: 200, body: "Memo deleted successfully." };
}
