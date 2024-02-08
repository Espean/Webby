const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { BlobServiceClient } = require('@azure/storage-blob');
const { Octokit } = require("@octokit/rest");

module.exports = async function (context) {
    try {
        const keyVaultName = process.env["webbykv"];
        const KVUri = "https://" + keyVaultName + ".vault.azure.net";

        // Specify the tenant ID in the environment variable
        process.env["AZURE_TENANT_ID"] = "b7cded65-4f72-4ee3-b7de-0806e47607a4"; // Replace <your-tenant-id> with your actual tenant ID

        const credential = new DefaultAzureCredential();
        const client = new SecretClient(KVUri, credential);

        const githubToken = await client.getSecret("gittoken");
        const storageConnectionString = await client.getSecret("saconnstring1");

        // Setup GitHub client
        const octokit = new Octokit({ auth: githubToken.value });

        // Fetch files from GitHub repo recursively
        const combinedContent = await fetchFilesRecursively(octokit, "Espean", "Webby");

        // Upload to Azure Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString.value);
        const containerClient = blobServiceClient.getContainerClient("webbycode");
        const blockBlobClient = containerClient.getBlockBlobClient("combinedFiles.txt");
        await blockBlobClient.upload(combinedContent, combinedContent.length);

        context.res = {
            status: 200,
            body: "Files uploaded successfully."
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: "Internal server error."
        };
    }
};

async function fetchFilesRecursively(octokit, owner, repo, path = '') {
    const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path
    });

    let combinedContent = "";
    for (const file of data) {
        if (file.type === 'file') {
            const fileData = await octokit.repos.getContent({
                owner,
                repo,
                path: file.path
            });
            const content = Buffer.from(fileData.data.content, 'base64').toString('utf-8');
            combinedContent += content + "\n";
        } else if (file.type === 'dir') {
            const subdirectoryContent = await fetchFilesRecursively(octokit, owner, repo, file.path);
            combinedContent += subdirectoryContent;
        }
    }
    return combinedContent;
}
