export function getBaseUrl(): string {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is required. Set it in .env before running browser tests.');
  }

  const parsedUrl = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('BASE_URL must use HTTP or HTTPS.');
  }

  return baseUrl;
}
