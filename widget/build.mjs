// widget/build.mjs
import { build } from 'esbuild';
import { mkdirSync } from 'fs';

mkdirSync('../server/public', { recursive: true });

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'Feedback',
  outfile: '../server/public/kkw.js',
  target: ['es2017'],
});

console.log('Built → server/public/kkw.js');
