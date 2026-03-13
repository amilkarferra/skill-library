import { execSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SUBSCRIPTION_ID = "fad72f76-ba9f-439a-ab5c-d4a0b534a0fa";
const RESOURCE_GROUP = "rg-skill-library";
const APP_NAME = "api-skill-library";
const BACKEND_DIR = resolve(import.meta.dirname, '..');
const ZIP_PATH = resolve(BACKEND_DIR, 'deploy.zip');
const DEPLOY_SOURCES = ['main.py', 'requirements.txt', 'app', 'alembic', 'alembic.ini'];

function executeCommand(command, stepName) {
  console.log(`\n> ${stepName}...`);
  execSync(command, { stdio: 'inherit', encoding: 'utf-8', cwd: BACKEND_DIR });
}

function createDeploymentZip() {
  const sourceList = DEPLOY_SOURCES.map(source => `'${source}'`).join(',');
  const powershellCommand = `Compress-Archive -Path ${sourceList} -DestinationPath 'deploy.zip' -Force`;
  executeCommand(
    `powershell.exe -NoProfile -Command "${powershellCommand}"`,
    'Creating deployment zip'
  );
}

function removeDeploymentZip() {
  const zipExists = existsSync(ZIP_PATH);
  if (zipExists) {
    rmSync(ZIP_PATH);
  }
}

async function deploy() {
  try {
    console.log('Starting backend deployment...\n');

    executeCommand(
      `az account set --subscription "${SUBSCRIPTION_ID}"`,
      'Setting Azure subscription'
    );

    removeDeploymentZip();
    createDeploymentZip();

    executeCommand(
      `az webapp deploy --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} --src-path deploy.zip --type zip`,
      'Deploying to Azure App Service'
    );

    removeDeploymentZip();

    console.log('\nDeployment completed');
    console.log('URL: https://api-skill-library.azurewebsites.net');
    console.log('Swagger: https://api-skill-library.azurewebsites.net/docs');
    console.log('Health: https://api-skill-library.azurewebsites.net/health');
  } catch (error) {
    removeDeploymentZip();
    console.error('\nDeployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
