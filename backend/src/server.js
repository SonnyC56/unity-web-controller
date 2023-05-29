import { createServer } from 'http';
import { parse } from 'url';
import { adminClient } from './clients/admin.js';
import { unityClient } from './clients/unity.js';
import { userClient } from './clients/user.js';

export const server = createServer();

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  if (pathname === '/user') {
    userClient.handleUpgrade(request, socket, head, function done(ws) {
      userClient.emit('connection', ws, request);
    });
  } else if (pathname === '/unity') {
    unityClient.handleUpgrade(request, socket, head, function done(ws) {
      unityClient.emit('connection', ws, request);
    });
  } else if (pathname === '/admin') {
    adminClient.handleUpgrade(request, socket, head, function done(ws) {
      adminClient.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});