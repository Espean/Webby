const { DefaultAzureCredential, DefaultAzureCredentialOptions } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { BlobServiceClient } = require('@azure/storage-blob');
const { Octokit } = require("@octokit/rest");

// Specify the tenant ID
const options = new DefaultAzureCredentialOptions();
options.managedIdentityClientId = process.env["AZURE_CLIENT_ID"]; // If using user-assigned managed identity
options.tenantId = process.env["AZURE_TENANT_ID"]; // Specify tenant ID here

const credential = new DefaultAzureCredential(options);
module.exports = async function (context) {
    const keyVaultName = process.env["webbykv"];
    const KVUri = "https://" + keyVaultName + ".vault.azure.net";

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(KVUri, credential);

    const githubToken = await client.getSecret("gittoken");
    const storageConnectionString = await client.getSecret("saconnstring1");

    // Setup GitHub client
    const octokit = new Octokit({ auth: githubToken.value });

    // Fetch files from GitHub repo (insert your repo details)
    const { data } = await octokit.repos.getContent({
        owner: "Espean",
        repo: "Webby",
        path: "" // root directory
    });

    // Combine file contents (simplified example, handle directories recursively)
    let combinedContent = "";
    for (const file of data) {
        if (file.type === 'file') {
            const fileData = await octokit.repos.getContent({
                owner: "Espean",
                repo: "Webby",
                path: file.path
            });
            const content = Buffer.from(fileData.data.content, 'base64').toString('utf-8');
            combinedContent += content + "\n";
        }
    }

    // Upload to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString.value);
    const containerClient = blobServiceClient.getContainerClient("webbycode");
    const blockBlobClient = containerClient.getBlockBlobClient("combinedFiles.txt");
    await blockBlobClient.upload(combinedContent, combinedContent.length);
};
