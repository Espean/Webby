variable "name" {
  description = "The name of the Function App."
  type        = string
}

variable "location" {
  description = "The Azure region where the Function App will be created."
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group in which to create the Function App."
  type        = string
}

variable "app_service_plan_id" {
  description = "The ID of the App Service Plan to be used by the Function App."
  type        = string
}

variable "storage_account_name" {
  description = "The name of the storage account that the Function App will use."
  type        = string
}

variable "os_type" {
  description = "The operating system type of the Function App. Possible values are `linux` or `windows`."
  type        = string
  default     = "linux"
}

variable "ftps_state" {
  description = "The FTPS state for the Function App. Set to 'AllAllowed', 'FtpsOnly', or 'Disabled'."
  type        = string
  default     = "Disabled"
}

variable "runtime" {
  description = "The runtime stack of the function app, e.g., 'node', 'python', 'dotnet', etc."
  type        = string
}

variable "run_from_package" {
  description = "The URL to a ZIP file containing the function app. Use '1' to enable run from package."
  type        = string
  default     = "1"
}
