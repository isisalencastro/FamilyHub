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

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

interface Rss2JsonItem {
    title: string;
    pubDate: string;
    link: string;
    description: string;
    thumbnail: string;
    enclosure?: { link?: string };
}

interface Rss2JsonResponse {
    status: string;
    items: Rss2JsonItem[];
}

function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

export async function fetchNews(category: NewsCategory, count = 8): Promise<NewsItem[]> {
    const feed = RSS_FEEDS[category];
    const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(feed.url)}&count=${count}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('RSS fetch failed');

        const data: Rss2JsonResponse = await response.json();

        if (data.status !== 'ok') throw new Error('RSS status not ok');

        return data.items.map((item) => ({
            title: item.title,
            link: item.link,
            description: stripHtml(item.description).slice(0, 160),
            thumbnail: item.thumbnail || item.enclosure?.link || '',
            pubDate: item.pubDate,
            source: feed.source,
        }));
    } catch (error) {
        console.error(`Failed to fetch ${category} news:`, error);
        return [];
    }
}
