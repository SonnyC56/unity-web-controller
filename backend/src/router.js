const server = createServer();

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  if (pathname === '/user') {
    userClient.handleUpgrade(request, socket, head, function done(ws) {
      userClient.emit('connection', ws, request);
    });
  } else if (pathname === '/target') {
    targetClient.handleUpgrade(request, socket, head, function done(ws) {
      targetClient.emit('connection', ws, request);
    });
  } else if (pathname === '/admin') {
    adminClient.handleUpgrade(request, socket, head, function done(ws) {
      adminClient.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});
