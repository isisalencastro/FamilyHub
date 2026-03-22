export interface NewsItem {
    title: string;
    link: string;
    description: string;
    thumbnail: string;
    pubDate: string;
    source: string;
}

export type NewsCategory = 'geral' | 'tecnologia' | 'educacao';

const RSS_FEEDS: Record<NewsCategory, { url: string; source: string }> = {
    geral: {
        url: 'https://g1.globo.com/rss/g1/',
        source: 'G1',
    },
    tecnologia: {
        url: 'https://g1.globo.com/rss/g1/tecnologia/',
        source: 'G1 Tecnologia',
    },
    educacao: {
        url: 'https://g1.globo.com/rss/g1/educacao/',
        source: 'G1 Educação',
    },
};

const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?url=',
];

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

export async function fetchNews(category: NewsCategory, count = 8): Promise<NewsItem[]> {
    const feed = RSS_FEEDS[category];
    const cacheKey = `news_cache_${category}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    // Check Cache
    if (cachedData) {
        try {
            const { timestamp, items } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_TTL && items && items.length > 0) {
                return items.slice(0, count);
            }
        } catch (e) {
            // Invalid cache, continue to fetch
        }
    }

    let lastError = null;

    // Multi-Proxy Fallback System
    for (const proxy of CORS_PROXIES) {
        const apiUrl = `${proxy}${encodeURIComponent(feed.url)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout per proxy

        try {
            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`RSS fetch failed with status ${response.status}`);

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const itemNodes = Array.from(xmlDoc.querySelectorAll('item'));
            if (itemNodes.length === 0) throw new Error('No items found or invalid XML format');

            const items: NewsItem[] = itemNodes.slice(0, 20).map((item) => {
                const title = item.querySelector('title')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '';
                const descriptionHtml = item.querySelector('description')?.textContent || '';
                const pubDate = item.querySelector('pubDate')?.textContent || '';

                let thumbnail = '';
                const mediaContent = item.getElementsByTagName('media:content');
                if (mediaContent.length > 0) {
                    thumbnail = mediaContent[0].getAttribute('url') || '';
                }
                if (!thumbnail) {
                    const enclosure = item.querySelector('enclosure');
                    if (enclosure) {
                        thumbnail = enclosure.getAttribute('url') || '';
                    }
                }

                return {
                    title,
                    link,
                    description: stripHtml(descriptionHtml).slice(0, 160),
                    thumbnail,
                    pubDate,
                    source: feed.source,
                };
            });

            // Save to Session Storage
            sessionStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                items
            }));

            return items.slice(0, count);
        } catch (error) {
            clearTimeout(timeoutId);
            lastError = error;
            console.warn(`Proxy ${proxy} failed for ${category}:`, error);
            // Will continue to the next proxy in the loop
        }
    }

    console.error(`All proxies failed to fetch ${category} news. Last error:`, lastError);
    return [];
}
