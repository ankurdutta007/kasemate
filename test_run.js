const { createServer } = require('vite');
const fetch = require('node-fetch'); // or use dynamic import

(async () => {
  const server = await createServer({
    configFile: 'vite.config.ts',
    server: { port: 8444 }
  });
  await server.listen();
  try {
    const res = await fetch('http://localhost:8444/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'c-0000', conversation_history: [], latest_user_message: 'Hi' })
    });
    console.log(await res.text());
  } catch (e) {
    console.error('Fetch Error:', e);
  }
  await server.close();
})();
