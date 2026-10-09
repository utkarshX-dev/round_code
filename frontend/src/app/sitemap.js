const publicRoutes = ['', '/rules', '/leaderboard', '/members', '/potw', '/login', '/register'];

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roundcode.vercel.app';

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === '/potw' || route === '/leaderboard' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/potw' ? 0.9 : 0.7,
  }));
}
