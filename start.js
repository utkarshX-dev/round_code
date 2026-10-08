import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

console.log(`${colors.cyan}${colors.bold}===================================================`);
console.log(`  🚀 ROUNDCode - Launching Platform Services`);
console.log(`===================================================${colors.reset}\n`);

console.log(`${colors.bold}📍 Services:${colors.reset}`);
console.log(`   • ${colors.cyan}Backend REST API:${colors.reset}  http://localhost:5000`);
console.log(`   • ${colors.magenta}Frontend Next.js:${colors.reset}  http://localhost:3000`);
console.log(`${colors.dim}   Press Ctrl+C to gracefully stop all services.${colors.reset}\n`);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

function prefixOutput(data, prefix, color) {
  const lines = data.toString().split(/\r?\n/);
  for (const line of lines) {
    if (line.trim().length > 0) {
      console.log(`${color}${colors.bold}[${prefix}]${colors.reset} ${line}`);
    }
  }
}

// Spawn Backend
const backendProcess = spawn(`${npmCmd} --prefix backend run dev`, {
  cwd: __dirname,
  env: process.env,
  shell: true,
});

backendProcess.stdout.on('data', (data) => prefixOutput(data, 'backend', colors.cyan));
backendProcess.stderr.on('data', (data) => prefixOutput(data, 'backend', colors.red));

// Spawn Frontend
const frontendProcess = spawn(`${npmCmd} --prefix frontend run dev`, {
  cwd: __dirname,
  env: process.env,
  shell: true,
});

frontendProcess.stdout.on('data', (data) => prefixOutput(data, 'frontend', colors.magenta));
frontendProcess.stderr.on('data', (data) => prefixOutput(data, 'frontend', colors.red));

function shutdown() {
  console.log(`\n${colors.yellow}Shutting down backend and frontend services...${colors.reset}`);

  if (isWindows) {
    try {
      if (backendProcess.pid) spawn('taskkill', ['/pid', backendProcess.pid.toString(), '/T', '/F']);
      if (frontendProcess.pid) spawn('taskkill', ['/pid', frontendProcess.pid.toString(), '/T', '/F']);
    } catch {
      // ignore
    }
  } else {
    backendProcess.kill('SIGTERM');
    frontendProcess.kill('SIGTERM');
  }

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

backendProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`${colors.red}[backend] Process exited with code ${code}${colors.reset}`);
  }
});

frontendProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`${colors.red}[frontend] Process exited with code ${code}${colors.reset}`);
  }
});
