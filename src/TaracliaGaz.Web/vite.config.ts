import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalized = id.replace(/\\/g, '/')
                    if (
                        normalized.includes('node_modules/react/') ||
                        normalized.includes('node_modules/react-dom/') ||
                        normalized.includes('node_modules/react-router') ||
                        normalized.includes('node_modules/scheduler/')
                    ) {
                        return 'vendor'
                    }
                },
            },
        },
    },
    server: {
        port: 5173,
        proxy: {
            // API запросы
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            // Статические загрузки
            '/uploads': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/images': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            // SEO файлы - проксируем на backend
            '/robots.txt': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/sitemap.xml': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/sitemap.xsl': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
        },
    },
})