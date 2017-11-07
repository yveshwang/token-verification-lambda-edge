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
const unauthorisedresponse = {
  statusCode: 401,
  body: "meh"
};
const defaulthappyresponse = {
  statusCode: 200,
  body: "happy"
};
/* export handler block for lmabda*/
exports.handler = (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log('started lambda function');
  var result = handle.processViewerRequest(event, unauthorisedresponse, options);
  if( result === unauthorisedresponse) {
    callback(null, unauthorisedresponse);
  } else {
    callback(null, defaulthappyresponse);
  }
}
