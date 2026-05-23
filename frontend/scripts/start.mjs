import { spawn } from 'child_process';

const port = process.env.PORT || 3000;
const child = spawn('npx', ['serve', 'dist', '-s', '-l', String(port)], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
