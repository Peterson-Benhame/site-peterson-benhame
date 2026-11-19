import { spawnSync } from 'node:child_process';

const env = { ...process.env, SITE_URL: process.env.SITE_URL || 'https://seo-fixture.invalid', BUILD_DIR: 'dist-test' };
for (const command of ['npm run build', 'npm test']) {
  const result = spawnSync(command, { shell: true, stdio: 'inherit', env });
  if (result.status !== 0) process.exit(result.status || 1);
}
