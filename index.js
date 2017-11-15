'use strict;'
const handle = require('./src/handle.js');

const options = [ {
  'headername': 'authorization',                // headername = name of the header to verify, usually lower case, following AWS Lambda Event structure
  'secret': 'secret',                           // secret = shared secret used for the hmac value for this header
  'audience': ['dk', 'no'],                     // aud = use locale as audience
  'issuer': ['urn:companyname:productname'],    // iss = fixed issuer urn
  'ignoreExpiration': false,                    // default to false, never ignoreExpiration
  'ignoreNotBefore': false,                     // default to false, never ignoreNotBefore
  'subject': 'id',                              // value could be id | payment which dictates if it is a identity token or payment token, or something else
  'clockTolerance': 0,                          // default to 0;
  'maxAge': '30d',                              // default to 30 days. we can always issue refresh token.
  'clockTimestamp': null                        // use system time.
}];

const errorcontent = `
<\!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>meh</title>
  </head>
  <body>
    <p></p>
  </body>
</html>
`;

const okcontent = `
<\!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>OK</title>
  </head>
  <body>
    <p></p>
  </body>
</html>
`;

const unauthorisedresponse = {
  status: 401,
  statusDescription: "Unauthorized",
  headers: {
              'content-type': [{
                  key: 'Content-Type',
                  value: 'text/html'
              }],
              'content-encoding': [{
                  key: 'Content-Encoding',
                  value: 'UTF-8'
              }],
          },
  body: errorcontent
};
const defaulthappyresponse = {
  status: 200,
  statusDescription: "OK",
  headers: {
              'content-type': [{
                  key: 'Content-Type',
                  value: 'text/html'
              }],
              'content-encoding': [{
                  key: 'Content-Encoding',
                  value: 'UTF-8'
              }],
          },
  body: okcontent
};
/* export handler block for lmabda*/
exports.handler = (event, context, callback) => {
  console.log('started lambda function');
  console.log(event, null, 2);
  if( event.path === '/edge') {
    callback(null, defaulthappyresponse);
  } else {
    var result = handle.processViewerRequest(event, unauthorisedresponse, options);
    let request = event.Records[0].cf.request;
    if( result === unauthorisedresponse) {
      callback(null, unauthorisedresponse);
    } else {
      callback(null, request);
    }
  }
}
