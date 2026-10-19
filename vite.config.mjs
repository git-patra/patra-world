import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
import {renderProfile} from './src/content-html.js';
export default defineConfig({
 base:'./',plugins:[react(),tailwindcss(),{name:'static-portfolio-content',transformIndexHtml(html){return html.replace('<!--PROFILE_CONTENT-->',renderProfile());}}],
 resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
 server:{host:'127.0.0.1',port:4176,strictPort:true},preview:{host:'127.0.0.1',port:4176,strictPort:true}
});
