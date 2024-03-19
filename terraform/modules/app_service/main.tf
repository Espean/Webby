resource "azurerm_app_service_plan" "this" {
  name                = var.app_service_plan_name
  location            = var.location
  resource_group_name = var.resource_group_name

  sku {
    tier = "Standard"
    size = "S1"
  }

  kind     = "Linux"
  reserved = true # Required for Linux plans
}

resource "azurerm_app_service" "this" {
  name                = var.app_service_name
  location            = var.location
  resource_group_name = var.resource_group_name
  app_service_plan_id = azurerm_app_service_plan.example.id

  site_config {
    linux_fx_version = "NODE|20-lts" # Example for Node.js 20 LTS
    always_on        = true
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false" # Example setting
  }

  identity {
    type = "SystemAssigned"
  }
}
