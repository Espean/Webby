resource "azurerm_function_app" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  app_service_plan_id = var.app_service_plan_id
  storage_account_name       = var.storage_account_name
  storage_account_access_key = data.azurerm_storage_account.example.primary_access_key
  os_type             = var.os_type
  site_config {
    ftps_state = var.ftps_state
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = var.runtime
    "AzureWebJobsStorage"      = data.azurerm_storage_account.example.primary_connection_string
    "WEBSITE_RUN_FROM_PACKAGE" = var.run_from_package
  }
  identity {
    type = "SystemAssigned"
  }
}

# Data source to access storage account information
data "azurerm_storage_account" "example" {
  name                = var.storage_account_name
  resource_group_name = var.resource_group_name
}
