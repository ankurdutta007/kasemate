import { build } from 'vite';

await build({
  root: process.cwd(),
  build: {
    ssr: 'api/chat.ts',
    outDir: 'dist-test',
  }
});
