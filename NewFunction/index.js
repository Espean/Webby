const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function (context, req) {
    const keyVaultName = process.env["webbykv"]; // Ensure this environment variable is set in your Function App settings
    const KVUri = "https://" + keyVaultName + ".vault.azure.net/";
    const secretName = "gittoken"; // Replace with your actual secret name

    // Attempt to explicitly specify the tenant ID for diagnostic purposes
    const tenantId = process.env["AZURE_TENANT_ID"]; // Ensure this is set in your Function App settings if attempting to use

    const credentialOptions = tenantId ? { tenantId } : {};
    const credential = new DefaultAzureCredential(credentialOptions);

    try {
        const client = new SecretClient(KVUri, credential);
        const secret = await client.getSecret(secretName);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: `Secret Value: ${secret.value}\nUsing tenant: ${tenantId}`
        };
    } catch (error) {
        context.log.error(`Error: ${error.message}`);
        context.res = {
            status: 500,
            body: `Failed to retrieve secret from Key Vault. Error: ${error.message}`
        };
    }
};
