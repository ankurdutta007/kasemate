const { createServer } = require('vite');
(async () => {
  const server = await createServer({
    configFile: false,
    server: { middlewareMode: true }
  });
  const module = await server.ssrLoadModule('/api/chat.ts');
  console.log('Loaded module:', !!module);
})();
