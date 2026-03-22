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

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

export async function fetchNews(category: NewsCategory, count = 8): Promise<NewsItem[]> {
    const feed = RSS_FEEDS[category];
    const apiUrl = `${CORS_PROXY}${encodeURIComponent(feed.url)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('RSS fetch failed');

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, count);

        return items.map((item) => {
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
    } catch (error) {
        console.error(`Failed to fetch ${category} news:`, error);
        return [];
    }
}
