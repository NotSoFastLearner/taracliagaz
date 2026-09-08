import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
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
            // SEO файлы - проксируем на backend
            '/robots.txt': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/sitemap.xml': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
        },
    },
})