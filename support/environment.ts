import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '../.env') });

export function getBaseUrl(): string {
  const baseUrl = process.env.BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error(
      'BASE_URL is required. Set it in the project .env file or environment before running browser tests.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error('BASE_URL must be a valid absolute URL, such as https://example.com.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('BASE_URL must use HTTP or HTTPS.');
  }

  return parsedUrl.toString();
}
