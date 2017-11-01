'use strict;'
const handle = require('./src/handle.js');

/* export handler block for lmabda*/
exports.handler = (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log('started lambda function');
  var result = handle.processViwerRequest(event, context);
  callback(null, {
        statusCode: 200,
        headers: { "x-custom-header" : result },
        body: "hello world"
  });
}
