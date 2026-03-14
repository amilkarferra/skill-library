import { execSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SUBSCRIPTION_ID = "fad72f76-ba9f-439a-ab5c-d4a0b534a0fa";
const RESOURCE_GROUP = "rg-skill-library";
const APP_NAME = "api-skill-library";
const BACKEND_DIR = resolve(import.meta.dirname, '..');
const ZIP_PATH = resolve(BACKEND_DIR, 'deploy.zip');
const DEPLOY_SOURCES = ['main.py', 'requirements.txt', 'app', 'alembic', 'alembic.ini'];
const DEPLOY_TIMEOUT_MS = 300000;
const SHOULD_TRACK_STARTUP_STATUS = false;
const SHOULD_ENABLE_VERBOSE_DEPLOYMENT_LOGS = true;

function executeCommand(command, stepName) {
  console.log(`\n> ${stepName}...`);
  execSync(command, { stdio: 'inherit', encoding: 'utf-8', cwd: BACKEND_DIR });
}

function executeCommandAndCapture(command, stepName) {
  console.log(`\n> ${stepName}...`);
  const commandOutput = execSync(command, { stdio: 'pipe', encoding: 'utf-8', cwd: BACKEND_DIR });
  return commandOutput.trim();
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

function printLatestDeploymentLogs() {
  try {
    const latestDeploymentId = executeCommandAndCapture(
      `az webapp log deployment list --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} --query "[0].id" -o tsv`,
      'Resolving latest deployment id'
    );

    const hasLatestDeploymentId = latestDeploymentId !== '';
    if (!hasLatestDeploymentId) {
      console.log('No deployment id was returned by Azure.');
      return;
    }

    console.log(`Latest deployment id: ${latestDeploymentId}`);

    executeCommand(
      `az webapp log deployment show --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} --deployment-id ${latestDeploymentId} -o table`,
      'Printing deployment log events'
    );
  } catch (error) {
    console.warn('\nUnable to print deployment logs:', error.message);
  }
}

async function deploy() {
  try {
    console.log('Starting backend deployment...\n');
    const deploymentVerbosityFlag = SHOULD_ENABLE_VERBOSE_DEPLOYMENT_LOGS ? '--verbose' : '';

    executeCommand(
      `az account set --subscription "${SUBSCRIPTION_ID}"`,
      'Setting Azure subscription'
    );

    removeDeploymentZip();
    createDeploymentZip();

    executeCommand(
      `az webapp deploy --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} --src-path deploy.zip --type zip --track-status ${SHOULD_TRACK_STARTUP_STATUS} --timeout ${DEPLOY_TIMEOUT_MS} ${deploymentVerbosityFlag}`,
      'Deploying to Azure App Service'
    );

    printLatestDeploymentLogs();
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
