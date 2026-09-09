module.exports = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ]}];
  }
};
