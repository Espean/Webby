const { ClientSecretCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function (context, req) {
    const keyVaultName = process.env["webbykv"]; // Ensure this environment variable is set in your Function App settings
    const KVUri = "https://" + keyVaultName + ".vault.azure.net/";
    const secretName = "gittoken"; // Replace with your actual secret name

    // Retrieve the values for your service principal from your Function App settings
    const tenantId = process.env["AZURE_TENANT_ID"];
    const clientId = process.env["AZURE_CLIENT_ID"];
    const clientSecret = process.env["AZURE_CLIENT_SECRET"];

    // Create the service principal credential
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

    try {
        const client = new SecretClient(KVUri, credential);
        const secret = await client.getSecret(secretName);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: `Secret Value: ${secret.value}`
        };
    } catch (error) {
        context.log.error(`Error: ${error.message}`);
        context.res = {
            status: 500,
            body: `Failed to retrieve secret from Key Vault. Error: ${error.message}`
        };
    }
};
