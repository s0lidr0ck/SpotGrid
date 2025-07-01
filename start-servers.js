#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting SpotGrid servers...\n');

// Function to start servers
const startServers = () => {
  // Start backend server
  console.log('🔧 Starting backend server (port 3001)...');
  const backendProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'server'),
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  // Start frontend server
  console.log('⚡ Starting frontend server (port 5173)...');
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  // Handle backend output
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[BACKEND] ${output.trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('NOTE: The AWS SDK')) { // Filter out AWS SDK deprecation warnings
      console.log(`[BACKEND ERROR] ${output.trim()}`);
    }
  });

  // Handle frontend output
  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[FRONTEND] ${output.trim()}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('update-browserslist-db')) { // Filter out browserslist warnings
      console.log(`[FRONTEND ERROR] ${output.trim()}`);
    }
  });

  // Handle process exits
  backendProcess.on('close', (code) => {
    console.log(`\n❌ Backend server exited with code ${code}`);
    process.exit(code);
  });

  frontendProcess.on('close', (code) => {
    console.log(`\n❌ Frontend server exited with code ${code}`);
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backendProcess.kill('SIGINT');
    frontendProcess.kill('SIGINT');
    
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  });

  // Success message
  setTimeout(() => {
    console.log('\n🎉 Both servers should be starting up!');
    console.log('📊 Backend: http://localhost:3001');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('\n💡 Press Ctrl+C to stop both servers');
  }, 3000);
};

// Kill any existing node processes first
console.log('🔄 Cleaning up existing processes...');
const killProcesses = spawn('taskkill', ['/f', '/im', 'node.exe'], {
  stdio: 'pipe',
  shell: true
});

killProcesses.on('close', (code) => {
  console.log('✅ Cleanup complete\n');
  startServers();
});

killProcesses.on('error', (err) => {
  // If taskkill fails, continue anyway
  console.log('Note: Could not kill existing processes (they may not exist)');
  console.log('✅ Continuing with startup\n');
  startServers();
}); 