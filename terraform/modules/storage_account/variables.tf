variable "storage_account_name" {
  type        = string
  description = "The name of the storage account"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group in which to create the storage account"
}

variable "location" {
  type        = string
  description = "The location/region where the storage account is created"
}

variable "account_tier" {
  type        = string
  description = "The tier to use for this storage account (e.g., Standard, Premium)"
}

variable "account_replication_type" {
  type        = string
  description = "The type of replication to use for this storage account (e.g., LRS, GRS, ZRS)"
}

variable "tags" {
  type        = map(string)
  description = "A mapping of tags to assign to the resource"
  default     = {}
}
