import { getApiKeyFromUrl } from './units';
function getKeyFromUrl(api) {
    try {
        const u = new URL(api);
        return u.searchParams.get('apiKey') || u.searchParams.get('token') || undefined;
    }
    catch {
        return undefined;
    }
}
export async function fetchWithRetry(url, options, maxRetries = 3) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            return response;
        }
        catch (error) {
            lastError = error;
            if (i === maxRetries) {
                throw error;
            }
            const delay = Math.pow(2, i) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            console.log(`网络请求失败，正在进行第 ${i + 1} 次重试...`);
        }
    }
    throw lastError;
}
export async function SearchServis(params) {
    const { api, body, apiKey, headers, signal, maxRetries = 3 } = params;
    const key = apiKey || getKeyFromUrl(api);
    const ac = new AbortController();
    if (signal)
        signal.addEventListener('abort', () => ac.abort(), { once: true });
    try {
        const KeyFromUrl = getApiKeyFromUrl();
        const response = await fetchWithRetry(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + KeyFromUrl,
                ...(key ? { Authorization: 'Bearer ' + key } : {}),
                ...(headers || {}),
            },
            body: JSON.stringify(body),
            signal: ac.signal,
        }, maxRetries);
        if (response.status === 401)
            throw new Error('账号未登录');
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(text || `HTTP ${response.status}`);
        }
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json'))
            return response.json();
        return response.text();
    }
    finally {
    }
}
export default SearchServis;
//# sourceMappingURL=SearchServis.js.map