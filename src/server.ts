// src/server.ts
import { WebSocket, WebSocketServer } from 'ws';

// start server function
export const startServer = (port: number): { wss: WebSocketServer, activeClients: Set<WebSocket> } => {
  const wss = new WebSocketServer({ port });
  const activeClients: Set<WebSocket> = new Set();

  console.log(`[SERVER] Broadcast server is running on ws://localhost:${port}`);

  wss.on('connection', ws => {
    console.log('[SERVER] Client connected');
    // add to active clients set
    activeClients.add(ws);
    console.log(`[SERVER] Active clients: ${activeClients.size}`);

    ws.on('message', message => {
      // Broadcast the message to all connected clients
      for (const client of activeClients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      }
      console.log(`[SERVER] Received and broadcasted: ${message}`);
    });

    ws.on('close', (event) => {
      // remove from active clients set
      activeClients.delete(ws);
      console.log(`[SERVER] Client disconnected. Active clients: ${activeClients.size}`);
    });

    ws.on('error', error => {
      console.error(`[SERVER] WebSocket error: ${error}`);
    });

    ws.send('Welcome to the broadcast server!');
  });

  return { wss, activeClients };
}

// server shutdown function
export const shutdownServer = (signal: string, server: WebSocketServer, clients: Set<WebSocket>): void => {
  console.log(`[SERVER] Received ${signal}. Starting shutdown...`);

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send('Server is shutting down...');
      client.close(1001, 'Server shutting down.');
    }
  }

  server.close(() => {
    console.log('[SERVER] All connections closed. Exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[SERVER] Could not close connections in time, forcing shutdown.');
    process.exit(1);
  }, 5000);
}