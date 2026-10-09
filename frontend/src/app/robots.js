export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profile', '/notifications'],
      },
    ],
    sitemap: 'https://roundcode.vercel.app/sitemap.xml',
  };
}
