import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/instagram-video-downloader',
    '/instagram-photo-downloader',
    '/instagram-audio-downloader',
    '/twitter-video-downloader',
    '/facebook-video-downloader',
    '/instagram-story-downloader-info',
    '/how-to-use',
    '/faq',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/dmca',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : route.includes('downloader') ? 0.8 : 0.5,
  }));
}
