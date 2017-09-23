```js
const zsDecoder = require('zippyshare-decoder');

// zsDecoder('<url>', <timeout>)
zsDecoder('<url>', 30000)
   .then(data => console.log(data))
   /*{
      url: '<real_url>',
      range: 'bytes',
      cookie: '<needed cookie>',
      filename: '<filename>'
   }*/
   .catch(err => console.error(err));
```
