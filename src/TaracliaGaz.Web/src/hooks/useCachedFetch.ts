import { useEffect, useState } from "react";

/**
 * L1 (RAM Map) + L2 (localStorage) SWR-кэш с 60-секундным окном свежести
 * и дедупликацией одновременных запросов (prefetch + click).
 */

const PREFIX = "tg_cache:";
// Кэш старше суток не показываем — защита от древних данных
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
// В пределах 60 сек повторно в сеть не ходим (bootstrap/prefetch уже принесли свежие данные)
const FRESH_TTL_MS = 60 * 1000;

interface CacheEntry<T> {
    ts: number;
    data: T;
}

const memCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function readEntry<T>(key: string): CacheEntry<T> | null {
    const now = Date.now();
    const mem = memCache.get(key) as CacheEntry<T> | undefined;
    if (mem) {
        if (now - mem.ts <= MAX_AGE_MS) return mem;
        memCache.delete(key);
        try {
            localStorage.removeItem(PREFIX + key);
        } catch {
            // ignore storage errors
        }
        return null;
    }

    try {
        const raw = localStorage.getItem(PREFIX + key);
        if (!raw) return null;
        const entry = JSON.parse(raw) as CacheEntry<T>;
        if (!entry || typeof entry.ts !== "number") return null;
        if (now - entry.ts > MAX_AGE_MS) {
            localStorage.removeItem(PREFIX + key);
            return null;
        }
        memCache.set(key, entry);
        return entry;
    } catch {
        // приватный режим / битый JSON — работаем без localStorage
        return null;
    }
}

export function readCache<T>(key: string): T | null {
    return readEntry<T>(key)?.data ?? null;
}

export function isCacheFresh(key: string): boolean {
    const entry = readEntry<unknown>(key);
    return entry !== null && Date.now() - entry.ts < FRESH_TTL_MS;
}

export function writeCache<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = { ts: Date.now(), data };
    memCache.set(key, entry);
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch {
        // переполнение localStorage — данные всё равно остаются в RAM-кэше
    }
}

export function invalidateCache(prefix = ""): void {
    for (const k of memCache.keys()) {
        if (k.startsWith(prefix) || k.startsWith("bootstrap:")) {
            memCache.delete(k);
        }
    }
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (
                k &&
                (k.startsWith(PREFIX + prefix) ||
                    k.startsWith(PREFIX + "bootstrap:"))
            ) {
                localStorage.removeItem(k);
            }
        }
    } catch {
        // ignore storage errors
    }
}

function fetchAndCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = inFlight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = fetcher()
        .then((fresh) => {
            writeCache(key, fresh);
            return fresh;
        })
        .finally(() => {
            inFlight.delete(key);
        });
    inFlight.set(key, promise);
    return promise;
}

/**
 * useCachedFetch("menu:ru", () => getMenu("ru"))
 * — сразу отдаёт кэш (если есть), в фоне ревалидирует по изменению `key`.
 * Параметр `_deps` устарел и сохранён только для совместимости вызовов.
 * loading=false, если данные уже есть (из кэша или после загрузки).
 */
export function useCachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    _deps?: unknown[] // eslint-disable-line @typescript-eslint/no-unused-vars -- deprecated: revalidation is driven solely by key
): { data: T | null; loading: boolean; error: boolean } {
    const [prevKey, setPrevKey] = useState(key);
    const [data, setData] = useState<T | null>(() => readCache<T>(key));
    const [loading, setLoading] = useState<boolean>(() => readCache<T>(key) === null);
    const [error, setError] = useState(false);

    if (prevKey !== key) {
        setPrevKey(key);
        const cached = readCache<T>(key);
        setData(cached);
        setLoading(cached === null);
        setError(false);
    }

    useEffect(() => {
        if (isCacheFresh(key)) return;

        let cancelled = false;

        fetchAndCache(key, fetcher)
            .then((fresh) => {
                if (!cancelled) {
                    setData(fresh);
                    setLoading(false);
                    setError(false);
                }
            })
            .catch((err) => {
                // Есть кэш — ошибка сети не страшна, оставляем кэшированное
                if (!cancelled) {
                    if (readCache<T>(key) === null) {
                        console.error(err);
                        setError(true);
                    }
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- ревалидацией управляет только key
    }, [key]);

    return { data, loading, error };
}

/**
 * Фоновая предзагрузка (например, при наведении на пункт меню):
 * кладёт данные в тот же кэш, что читает useCachedFetch,
 * поэтому переход на страницу рендерится мгновенно.
 * Если данные уже свежие (<60 сек) или запрос уже в полёте — ничего не делает.
 */
export function prefetchCache<T>(key: string, fetcher: () => Promise<T>): void {
    if (isCacheFresh(key)) return;
    void fetchAndCache(key, fetcher).catch(() => {
        // фоновая предзагрузка — ошибки игнорируем
    });
}
