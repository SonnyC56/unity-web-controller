import { createServer } from 'http';
import { parse } from 'url';
import { adminSocket } from './sockets/admin.js';
import { unitySocket } from './sockets/unity.js';
import { userSocket } from './sockets/user.js';
import { profileSocket } from './sockets/profile.js';

export const server = createServer();

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  if (pathname === '/user') {
    userSocket.handleUpgrade(request, socket, head, function done(ws) {
      userSocket.emit('connection', ws, request);
    });
  } else if (pathname === '/unity') {
    unitySocket.handleUpgrade(request, socket, head, function done(ws) {
      unitySocket.emit('connection', ws, request);
    });
  } else if (pathname === '/admin') {
    adminSocket.handleUpgrade(request, socket, head, function done(ws) {
      adminSocket.emit('connection', ws, request);
    })
    ;
  } else if (pathname === '/profile') {
    profileSocket.handleUpgrade(request, socket, head, function done(ws) {
      profileSocket.emit('connection', ws, request);
    })
    ;
  } else {
    socket.destroy();
  }
});
