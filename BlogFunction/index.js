const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { BlobServiceClient } = require('@azure/storage-blob');
const { Pool } = require('pg');
const formidable = require('formidable-serverless');

// Setup Key Vault for accessing secrets
const keyVaultName = process.env["KEY_VAULT_NAME"];
const KVUri = `https://${keyVaultName}.vault.azure.net`;

// Initialize PostgreSQL connection
const pool = new Pool({
    connectionString: process.env["PG_CONNECTION_STRING"] // Assuming PG_CONNECTION_STRING is set in function app settings
});

async function getSecret(secretName) {
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(KVUri, credential);
    const secretBundle = await client.getSecret(secretName);
    return secretBundle.value;
}

async function uploadFileToBlob(file) {
    const connectionString = await getSecret("AZURE_STORAGE_CONNECTION_STRING");
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerName = "blogg";
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `${new Date().getTime()}-${file.originalFilename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(file.filepath);

    return blockBlobClient.url;
}

module.exports = async function (context, req) {
    switch (req.method) {
        case 'POST':
            const form = new formidable.IncomingForm();
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    context.res = { status: 500, body: "File upload error" };
                    return;
                }

                // Assuming there's a file upload. If not, adjust logic accordingly.
                const file = files.file; // Adjust 'file' based on your input's name attribute
                const fileUrl = await uploadFileToBlob(file);

                // Insert post data into PostgreSQL
                const client = await pool.connect();
                try {
                    const result = await client.query(
                        "INSERT INTO blog_posts (title, content, file_url) VALUES ($1, $2, $3) RETURNING *;",
                        [fields.title, fields.content, fileUrl]
                    );
                    context.res = { status: 200, body: result.rows[0] };
                } catch (error) {
                    context.res = { status: 500, body: "Database insertion error" };
                } finally {
                    client.release();
                }
            });
            break;
        case 'GET':
            // Fetch posts from PostgreSQL
            try {
                const client = await pool.connect();
                const result = await client.query("SELECT * FROM blog_posts;");
                context.res = { status: 200, body: result.rows };
                client.release();
            } catch (error) {
                context.res = { status: 500, body: "Database fetch error" };
            }
            break;
        // Implement other methods (PUT, DELETE) as needed
    }
};
