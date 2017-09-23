const cheerio = require('cheerio');
const fetch = require('node-fetch');
const safeEval = require('safe-eval');

function isValidUrl(url) {
   return (/^http:\/\/www[0-9]*\.zippyshare\.com\/v\/[^\/]+\/file\.html/).test(url);
}

function getCookie(headers) {
   const setCookieList = headers['set-cookie'];
   if( !Array.isArray(setCookieList) )
      return null;

   for(const setCookie of setCookieList) {
      const tester = /JSESSIONID\s*=\s*([^;]+)/;
      const result = tester.exec(setCookie);

      if( result )
         return `JSESSIONID=${result[1]}`;
   }
}

function getJsCode(body) {
   const $ = cheerio.load(body);
   const scripts = $('script');

   for(let i = 0; i < scripts.length; i++) {
      const children = scripts[i].children;
      if( !Array.isArray(children) )
         continue;

      for(let j = 0; j < children.length; j++) {
         const data = children[j].data;
         if(typeof data !== 'string')
            continue;

         const tester = /document\s*\.\s*getElementById\s*\(\s*'dlbutton'\s*\)\s*\.\s*href\s*=/;
         if( tester.test(data) )
            return data;
      }
   }
}

function getRealUrl(url, jsCode) {
   const context = {
      document: {
         getElementById: id => {
            if( id === 'dlbutton' )
               return context.result;
            else
               return {};
         }
      },
      result: {}
   };

   try {
      safeEval(jsCode, context);
   } catch(err) {
      return;
   }

   if( !context.result.href )
      return;

   let baseUrl = (/^http:\/\/www[0-9]*\.zippyshare\.com/).exec(url);

   if( !Array.isArray(baseUrl) )
      return;

   baseUrl = baseUrl[0];

   return baseUrl + context.result.href;
}

function getFilename(realUrl) {
   const result = (/([^\/]+)\/?$/).exec(realUrl);

   if( !result )
      return;

   return decodeURIComponent(result[1]);
}

async function main(url, timeout) {
   if( !isValidUrl(url) )
      throw new Error('not a valid url');

   const res = await fetch(url, {
      timeout
   });

   if( !res.ok )
      throw new Error(`response status code: ${res.status}`);

   const cookie = getCookie(res.headers._headers);
   if( !cookie )
      throw new Error('cookie JSESSIONID not found');

   const body = await res.text();
   const jsCode = getJsCode(body);
   if( !jsCode )
      throw new Error('the javascript code not found');

   const realUrl = getRealUrl(url, jsCode);
   if( !realUrl )
      throw new Error('the javascript code not found');

   const filename = getFilename(realUrl);
   if( !filename )
      throw new Error('filename not found');

   return {
      url: realUrl,
      cookie,
      filename,
      range: 'bytes'
   };
}

module.exports = main;
