// src/client.ts
import WebSocket from 'ws';
import * as process from 'process';

export const createClient = (host: string, port: number): void => {
  const ws = new WebSocket(`ws://${host}:${port}`);

  ws.on('open', () => {
    console.log(`[CLIENT] Connected to broadcast server at port ${port}`);
    process.stdout.write('> ');
  });

  // handle incoming broadcast from server
  ws.on('message', (data)=> {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    console.log(`Broadcast: ${data}`);

    process.stdout.write('> ');
  });

  // handle user input from terminal
  process.stdin.on('data', (data) => {
    const input = data.toString().trim();

    if (input) {
      ws.send(input);
    }

    process.stdout.write('> ');
  });

  ws.on('close', () => {
    console.log('[CLIENT] Connection closed by broadcast server.');
    process.exit();
  });

  ws.on('error', (error) => {
    console.error(`[CLIENT] Connection error: ${error.message}`);
    process.exit(1);
  });
}

