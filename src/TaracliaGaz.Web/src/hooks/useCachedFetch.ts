import { useEffect, useState } from "react";

/**
 * Stale-while-revalidate кэш в localStorage.
 *
 * При повторном визите (или возврате на страницу) данные рисуются
 * мгновенно из кэша, свежая версия подгружается с API в фоне и
 * подменяет содержимое. Защищает от медленных ответов API
 * (shared-хостинг: Passenger/LVE ~0.6–0.8 c даже в тёплом состоянии)
 * и от холодного старта после простоя.
 */

const PREFIX = "tg_cache:";
// Кэш старше суток не показываем — защита от древних данных
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
    ts: number;
    data: T;
}

function readCache<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        if (!raw) return null;
        const entry = JSON.parse(raw) as CacheEntry<T>;
        if (!entry || typeof entry.ts !== "number") return null;
        if (Date.now() - entry.ts > MAX_AGE_MS) return null;
        return entry.data;
    } catch {
        // приватный режим / битый JSON — работаем без кэша
        return null;
    }
}

function writeCache<T>(key: string, data: T): void {
    try {
        localStorage.setItem(
            PREFIX + key,
            JSON.stringify({ ts: Date.now(), data } satisfies CacheEntry<T>)
        );
    } catch {
        // переполнение localStorage — просто не кэшируем
    }
}

/**
 * useCachedFetch("menu:ru", () => getMenu("ru"), [language])
 * — сразу отдаёт кэш (если есть), в фоне ревалидирует.
 * loading=false, если данные уже есть (из кэша или после загрузки).
 */
export function useCachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    deps: unknown[] = []
): { data: T | null; loading: boolean; error: boolean } {
    const [data, setData] = useState<T | null>(() => readCache<T>(key));
    const [loading, setLoading] = useState<boolean>(
        () => readCache<T>(key) === null
    );
    const [error, setError] = useState(false);

    useEffect(() => {
        const cached = readCache<T>(key);
        if (cached !== null) {
            setData(cached);
            setLoading(false);
        } else {
            setLoading(true);
        }
        setError(false);

        let cancelled = false;
        fetcher()
            .then((fresh) => {
                writeCache(key, fresh);
                if (!cancelled) {
                    setData(fresh);
                    setLoading(false);
                }
            })
            .catch((err) => {
                // Есть кэш — ошибка сети не страшна, оставляем кэшированное
                if (cached === null) {
                    console.error(err);
                    if (!cancelled) setError(true);
                }
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error };
}

/**
 * Фоновая предзагрузка (например, при наведении на пункт меню):
 * кладёт данные в тот же кэш, что читает useCachedFetch,
 * поэтому переход на страницу рендерится мгновенно.
 * Если свежий кэш уже есть — ничего не делает.
 */
export function prefetchCache<T>(key: string, fetcher: () => Promise<T>): void {
    if (readCache<T>(key) !== null) return;
    fetcher()
        .then((data) => writeCache(key, data))
        .catch(() => {
            // фоновая предзагрузка — ошибки игнорируем
        });
}
