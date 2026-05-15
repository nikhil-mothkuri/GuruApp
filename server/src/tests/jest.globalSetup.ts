import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .reduce<Record<string, string>>((acc, line) => {
      const eq = line.indexOf('=');
      if (eq === -1) return acc;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      acc[key] = val;
      return acc;
    }, {});
}

export default async function globalSetup() {
  const serverDir = path.resolve(__dirname, '../../');
  const envTest = loadEnvFile(path.join(serverDir, '.env.test'));

  const dbUrl = envTest['TEST_DATABASE_URL'] ?? envTest['DATABASE_URL'] ?? '';

  // Inject all required env vars into the current process
  process.env['NODE_ENV'] = 'test';
  process.env['DATABASE_URL'] = dbUrl;
  process.env['TEST_DATABASE_URL'] = dbUrl;
  process.env['JWT_ACCESS_SECRET'] = envTest['JWT_ACCESS_SECRET'] ?? 'test-access-secret-32-characters-min';
  process.env['JWT_REFRESH_SECRET'] = envTest['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret-32-chars-min!!';
  process.env['JWT_ACCESS_EXPIRES_IN'] = '15m';
  process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
  process.env['GOOGLE_CLIENT_ID'] = 'test-google-client-id';
  process.env['UPLOAD_DIR'] = 'uploads-test';
  process.env['MAX_FILE_SIZE_MB'] = '5';

  const binExt = process.platform === 'win32' ? '.CMD' : '';
  const prismaBin = path.join(serverDir, 'node_modules', '.bin', `prisma${binExt}`);

  execSync(`"${prismaBin}" migrate deploy`, {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit',
    cwd: serverDir,
  });
}
