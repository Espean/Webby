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
        const { combinedContent, fileStructure } = await fetchFilesRecursively(octokit, "Espean", "Webby");

        // Create combined content with folder structure at the top
        const combinedWithStructure = JSON.stringify(fileStructure) + '\n\n' + combinedContent;

        // Upload combined content with folder structure to Azure Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString.value);
        const containerClient = blobServiceClient.getContainerClient("webbycode");
        const blockBlobClient = containerClient.getBlockBlobClient("combinedFiles.txt");
        await blockBlobClient.upload(combinedWithStructure, combinedWithStructure.length);

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
    let fileStructure = { type: 'folder', name: path, children: [] };

    for (const file of data) {
        if (file.type === 'file') {
            const fileData = await octokit.repos.getContent({
                owner,
                repo,
                path: file.path
            });
            const content = Buffer.from(fileData.data.content, 'base64').toString('utf-8');
            const filePath = `${path}/${file.name}`;
            combinedContent += `// This is file in path ${filePath}\n${content}\n\n`;
            fileStructure.children.push({ type: 'file', name: file.name, path: filePath });
        } else if (file.type === 'dir') {
            const subdirectoryResult = await fetchFilesRecursively(octokit, owner, repo, file.path);
            const directoryPath = `${path}/${file.name}`;
            fileStructure.children.push({ type: 'folder', name: file.name, path: directoryPath, children: subdirectoryResult.fileStructure });
        }
    }

    return { combinedContent, fileStructure };
}
