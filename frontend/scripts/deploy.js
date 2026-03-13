import { execSync } from 'child_process';

const DEPLOYMENT_TOKEN = "556d05ba22fb5b39b244accc210f3b922c00d6912d371a7603efa17d4b2d727002-015bcbf7-2172-4361-acd1-e3300460afd200306260a61ff503";
const DIST_PATH = "./dist";

function executeCommand(command, stepName) {
  console.log(`\n> ${stepName}...`);
  execSync(command, { stdio: 'inherit', encoding: 'utf-8' });
}

async function deploy() {
  try {
    console.log('Starting frontend deployment...\n');

    executeCommand('npm run build', 'Building frontend');

    executeCommand(
      `swa deploy ${DIST_PATH} --deployment-token ${DEPLOYMENT_TOKEN} --env production`,
      'Deploying to Azure Static Web App'
    );

    console.log('\nDeployment completed');
    console.log('URL: https://lemon-tree-0a61ff503.2.azurestaticapps.net');
  } catch (error) {
    console.error('\nDeployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
