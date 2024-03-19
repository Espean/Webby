module "function_app" {
  source                = "../../modules/function_app"
  name                  = "webbyapi"
  location              = "norwayeast"
  resource_group_name   = "WebbyApi_api"
  app_service_plan_id   = "<your_app_service_plan_id>"
  storage_account_name  = "webbyapiapiaa1f"
  os_type               = "linux"
  ftps_state            = "Disabled"
  runtime               = "node"
  run_from_package      = "1"
}

module "app_service" {
  source = "../../modules/app_service"
  app_service_name       = "mywebbsi-prod"
  app_service_plan_name  = "mywebbsi-prod-plan"
  location               = "norwayeast"
  resource_group_name    = "mywebbsi-prod-rg"
}

module "key_vault" {
  source              = "../../modules/key_vault"
  name                = "webbykv"
  location            = "norwayeast"
  resource_group_name = "mywebbsi_group"
  tenant_id           = "YOUR_TENANT_ID_HERE"
  object_id           = "YOUR_OBJECT_ID_HERE"
}

module "storage_account" {
  source = "../../modules/storage_account"

  storage_account_name      = "webbyapiapiaa1f"
  resource_group_name       = "WebbyApi_api"
  location                  = "norwayeast"
  account_tier              = "Standard"
  account_replication_type  = "GRS"
  tags                      = {
    environment = "prod"
  }
}
