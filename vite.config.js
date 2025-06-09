import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue'
export default defineConfig({
    plugins: [
        vue(
            {
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }
        ),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
        resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
        server: {
        host: '192.168.1.16',
        port: 5173,  // Default Vite port
        hmr: {
            host: '192.168.1.16',
        },
    },
});
