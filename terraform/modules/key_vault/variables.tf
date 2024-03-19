variable "name" {
  description = "The name of the key vault"
  type        = string
}

variable "location" {
  description = "The location of the key vault"
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group in which to create the key vault"
  type        = string
}

variable "tenant_id" {
  description = "The tenant ID for the key vault"
  type        = string
}

variable "object_id" {
  description = "The object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The specified object must have the keys/get permission."
  type        = string
}

variable "sku_name" {
  description = "The Name of the SKU used for this Key Vault. Possible values are standard and premium."
  type        = string
  default     = "standard"
}
