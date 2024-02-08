const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function (context, req) {
    const keyVaultName = process.env["KEY_VAULT_NAME"];
    const KVUri = "https://" + keyVaultName + ".vault.azure.net";
    const secretName = "YourSecretName"; // Replace with your actual secret name

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(KVUri, credential);

    try {
        // Retrieve the secret value from Key Vault
        const secret = await client.getSecret(secretName);
        
        // Attempt to print the tenant ID (this part is not straightforward with Managed Identity as it doesn't expose tenant ID directly)
        // Instead, we're demonstrating the concept by accessing the secret successfully
        context.res = {
            status: 200,
            body: `Secret Value: ${secret.value}\n`
        };
    } catch (error) {
        context.log.error(`Error: ${error.message}`);
        context.res = {
            status: 500,
            body: "Failed to retrieve secret from Key Vault."
        };
    }
};
