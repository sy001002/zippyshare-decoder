```js
const zsDecoder = require('zippyshare-decoder');

try {
   const data = await zsDecoder('<url>', {
      // default opts:
      timeout: 30000,
      retry: 3,
      retryDelay: 3000
   });

   console.log(data);
   /*
   {
      url: '<real_url>',
      cookie: '<needed cookie>',
      filename: '<filename>'
   }
   */
} catch(err) {
   console.error(err);
}
```
