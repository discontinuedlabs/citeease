if(!self.define){let e,i={};const n=(n,r)=>(n=new URL(n+".js",r).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(r,t)=>{const s=e||("document"in self?document.currentScript.src:"")||location.href;if(i[s])return;let o={};const l=e=>n(e,s),u={module:{uri:s},exports:o,require:l};i[s]=Promise.all(r.map((e=>u[e]||l(e)))).then((e=>(t(...e),o)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"index-qcH09zNv.css",revision:null},{url:"index.html",revision:null},{url:"registerSW.js",revision:null},{url:"manifest.webmanifest",revision:"153647c6d6fbdf26ba237e54a75eba05"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
