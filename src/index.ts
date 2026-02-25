#!/usr/bin/env npx tsx
// src/index.ts
import { WebSocket, WebSocketServer } from 'ws';
import { shutdownServer, startServer } from './server.js';
import { createClient } from './client.js';

// default server port to 3000
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// default websocket url
const HOST = process.env.HOST ?? 'localhost';

// get process args without node and script path
const [ command, ...args ]: string[] = process.argv.slice(2);
let rootServer: { wss: WebSocketServer, activeClients: Set<WebSocket>};

// start broadcast server handler
const startBroadcastServer = (port: number): void => {
  try {
    // start broadcast server
    rootServer = startServer(port);
  } catch (err) {
    console.error('[MAIN] broadcast-server error: ', err);
  }
}

// connect client handler
const connectBroadcastClient = (host: string, port: number): void => {
  try {
    // create client connection
    createClient(host, port);
  } catch (err) {
    console.error('[MAIN] broadcast-server error: ', err);
  }
}

// display CLI command options handler
const displayHelp = (): void => {
  console.log('broadcast-server CLI usage:');
  console.log('   start <port>    - Start the broadcast server and accept client connections');
  console.log('   connect         - Connect as a client and broadcast messages to all other clients');
  console.log('   help            - Display all command options');
}

const handleCommand = (command: string, args: string[]): void => {
  switch (command) {
    case 'start':
      const serverPort: number = parseInt(args[0]?.toString().trim()) || PORT;
      startBroadcastServer(serverPort);

      process.on('SIGINT', () => shutdownServer('SIGINT', rootServer.wss, rootServer.activeClients));
      process.on('SIGTERM', () => shutdownServer('SIGTERM', rootServer.wss, rootServer.activeClients));

      break;
    case 'connect': 
      const host: string = args[0]?.toString().trim() || HOST;
      const clientPort: number = parseInt(args[1]?.toString().trim()) || PORT;

      connectBroadcastClient(host, clientPort);
      break;
    case 'help':
      displayHelp();
      break;
    default: 
      console.error(`[MAIN] Error: Unknown command '${command}'`);
      displayHelp();
      break;
  }
}

handleCommand(command, args);