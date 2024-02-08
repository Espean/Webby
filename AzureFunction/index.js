const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { BlobServiceClient } = require('@azure/storage-blob');
const { Octokit } = require("@octokit/rest");

module.exports = async function (context) {
    try {
        const keyVaultName = process.env["webbykv"];
        const KVUri = `https://${keyVaultName}.vault.azure.net`;
        const credential = new DefaultAzureCredential();
        const client = new SecretClient(KVUri, credential);

        const githubToken = await client.getSecret("gittoken");
        const storageConnectionString = await client.getSecret("saconnstring1");

        const octokit = new Octokit({ auth: githubToken.value });
        const { combinedContent, fileStructure } = await fetchFilesRecursively(octokit, "Espean", "Webby");

        const combinedWithStructure = JSON.stringify(fileStructure, null, 2) + '\n\n' + combinedContent;

        const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString.value);
        const containerClient = blobServiceClient.getContainerClient("webbycode");
        const blockBlobClient = containerClient.getBlockBlobClient("combinedFiles.txt");
        await blockBlobClient.upload(combinedWithStructure, Buffer.byteLength(combinedWithStructure));

        context.res = { status: 200, body: "Files uploaded successfully." };
    } catch (error) {
        context.log.error(error);
        context.res = { status: 500, body: "Internal server error." };
    }
};

async function fetchFilesRecursively(octokit, owner, repo, path = '') {
    let combinedContent = "";
    let fileStructure = { type: 'folder', name: path || repo, children: [] };

    const { data } = await octokit.repos.getContent({ owner, repo, path }).catch(error => {
        console.error(`Error fetching content for path: ${path}`, error);
        return { data: [] }; // Return empty to allow continuation
    });

    for (const file of data) {
        if (file.type === 'file') {
            const fileData = await octokit.repos.getContent({
                owner,
                repo,
                path: file.path
            }).catch(error => {
                console.error(`Error fetching file: ${file.path}`, error);
                return null; // Skip this file if error occurs
            });
            if (fileData) {
                const content = Buffer.from(fileData.data.content, 'base64').toString('utf-8');
                combinedContent += `// File: ${file.path}\n${content}\n\n`;
                fileStructure.children.push({ type: 'file', name: file.name, path: file.path });
            }
        } else if (file.type === 'dir') {
            const subdirectoryResult = await fetchFilesRecursively(octokit, owner, repo, file.path);
            combinedContent += subdirectoryResult.combinedContent; // Append content from subdirectories
            fileStructure.children.push({ ...subdirectoryResult.fileStructure, name: file.name, path: file.path });
        }
    }

    return { combinedContent, fileStructure };
}
