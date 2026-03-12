# Skill Library - Infrastructure Plan

**Provisioned:** 2026-03-11
**Subscription:** `fad72f76-ba9f-439a-ab5c-d4a0b534a0fa` (Pay-As-You-Go)
**Tenant:** `c4af4f64-5123-4173-aa2e-d4b9256ce51d`
**Region:** West Europe

---

## Resource Inventory

| Resource | Name | Tier | URL / FQDN |
|---|---|---|---|
| Resource Group | `rg-skill-library` | - | westeurope |
| SQL Server | `sql-skill-library` | - | `sql-skill-library.database.windows.net` |
| SQL Database | `db-skill-library` | Basic | - |
| Storage Account | `stskilllibraryfiles` | Standard LRS | - |
| Blob Container | `skill-files` | - | inside `stskilllibraryfiles` |
| App Service Plan | `asp-skill-library` | Linux B1 | - |
| App Service (API) | `api-skill-library` | Python 3.12 | `https://api-skill-library.azurewebsites.net` |
| Static Web App | `swa-skill-library` | Free | pending deployment |
| Key Vault | `kv-skill-library` | Standard | `https://kv-skill-library.vault.azure.net` |

## Entra ID App Registration

| Field | Value |
|---|---|
| Display name | `skill-library-spa` |
| Application (client) ID | `13cadc9a-480a-4ba6-8492-74c4a7e0e7b4` |
| Directory (tenant) ID | `c4af4f64-5123-4173-aa2e-d4b9256ce51d` |
| Supported account types | `AzureADandPersonalMicrosoftAccount` |
| Redirect URIs | `http://localhost:5173`, `http://localhost:5173/redirect.html`, `https://lemon-tree-0a61ff503.2.azurestaticapps.net`, `https://lemon-tree-0a61ff503.2.azurestaticapps.net/redirect.html` |

## Key Vault Secrets

| Secret Name | Content |
|---|---|
| `jwt-secret` | Random 48-byte base64 key for signing app JWTs |
| `database-url` | ODBC connection string for SQL Server |
| `storage-connection-string` | Azure Storage Account connection string |
| `azure-ad-tenant-id` | `c4af4f64-5123-4173-aa2e-d4b9256ce51d` |
| `azure-ad-client-id` | `13cadc9a-480a-4ba6-8492-74c4a7e0e7b4` |
| `azure-storage-container` | `skill-files` |

## SQL Server Admin Credentials

| Field | Value |
|---|---|
| Admin username | `skilladmin` |
| Admin password | Stored in Key Vault under `database-url` |

---

## Pending Tasks

### SQL Server
- [x] Add firewall rule to allow Azure services (`AllowAzureServices`: 0.0.0.0 - 0.0.0.0)
- [x] Add firewall rule for dev machine (`AllowDevMachine`: 188.79.93.19)
- [x] Run Alembic migrations to create database schema — **dev task, resolves MED-04**

### App Service (API)
- [x] Enable managed identity — `principalId: 0272ca6f-1ab0-4e73-90f7-bb1836409fa4`
- [x] Grant managed identity `Key Vault Secrets User` role on `kv-skill-library`
- [x] Configure app settings with Key Vault references (`DATABASE_URL`, `JWT_SECRET`, `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_AD_TENANT_ID`, `AZURE_AD_CLIENT_ID`, `AZURE_STORAGE_CONTAINER`)
- [x] Configure startup command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- [x] CORS: `http://localhost:5173` (dev)
- [x] CORS: `https://lemon-tree-0a61ff503.2.azurestaticapps.net` (production)

### Static Web App
- [x] Hostname: `lemon-tree-0a61ff503.2.azurestaticapps.net`
- [x] Environment variables configured: `VITE_API_BASE_URL`, `VITE_AZURE_AD_CLIENT_ID`, `VITE_AZURE_AD_TENANT_ID`
- [ ] First manual deploy — run `npm run build` and deploy `dist/` with Azure Static Web Apps CLI (`swa deploy`)

### App Registration (Entra ID)
- [x] Redirect URIs: `http://localhost:5173`, `http://localhost:5173/redirect.html`, `https://lemon-tree-0a61ff503.2.azurestaticapps.net`, `https://lemon-tree-0a61ff503.2.azurestaticapps.net/redirect.html`
- [x] Token configuration: access token + ID token issuance enabled

### Key Vault
- [x] App Service managed identity granted `Key Vault Secrets User` role
- [x] Backend integration: `key_vault_resolver.py` resolves secrets at startup via `DefaultAzureCredential` + `InteractiveBrowserCredential` fallback (AD-06)
