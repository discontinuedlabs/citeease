if(!self.define){let e,i={};const n=(n,r)=>(n=new URL(n+".js",r).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(r,s)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let l={};const u=e=>n(e,o),t={module:{uri:o},exports:l,require:u};i[o]=Promise.all(r.map((e=>t[e]||u(e)))).then((e=>(s(...e),l)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"favicon.ico",revision:null},{url:"images/favicons/android-chrome-192x192.png",revision:null},{url:"images/favicons/android-chrome-512x512.png",revision:null},{url:"images/favicons/apple-touch-icon.png",revision:null},{url:"images/favicons/favicon-16x16.png",revision:null},{url:"images/favicons/favicon-32x32.png",revision:null},{url:"images/head.svg",revision:null},{url:"images/heart.svg",revision:null},{url:"index-D3ON54oa.css",revision:null},{url:"index.html",revision:null},{url:"registerSW.js",revision:null},{url:"manifest.webmanifest",revision:"153647c6d6fbdf26ba237e54a75eba05"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
