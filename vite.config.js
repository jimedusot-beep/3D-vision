import {defineConfig} from 'vite';
export default defineConfig({base:'./',publicDir:'public',build:{rollupOptions:{input:{main:'index.html',library:'library.html',legacy:'legacy.html'}},chunkSizeWarningLimit:1100},server:{allowedHosts:['terminal.local']}});
