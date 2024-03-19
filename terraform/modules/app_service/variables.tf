variable "app_service_name" {
  type        = string
  description = "The name of the Azure App Service."
}

variable "app_service_plan_name" {
  type        = string
  description = "The name of the Azure App Service Plan."
}

variable "location" {
  type        = string
  description = "The Azure region where the App Service should be created."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group in which to create the App Service and App Service Plan."
}
