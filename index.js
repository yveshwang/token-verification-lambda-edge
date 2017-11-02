'use strict;'
const handle = require('./src/handle.js');
const secret = 'secret';
const audience = ['dk', 'no'];                  // aud = use locale as audience
const issuer = ['urn:companyname:productname']; // iss = fixed issuer urn
const ignoreExpiration = false;                 // default to false, never ignoreExpiration
const ignoreNotBefore = false;                  // default to false, never ignoreNotBefore
const subject = 'id';                           // value could be id | payment which dictates if it is a identity token or payment token, or something else
const clockTolerance = 0;                       // default to 0;
const maxAge = '30d';                           // default to 30 days. we can always issue refresh token.
const clockTimestamp = null;                    // use system time.
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
  var result = handle.processViewerRequest(event, secret, unauthorisedresponse, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp);
  if( result === unauthorisedresponse) {
    callback(null, unauthorisedresponse);
  } else {
    callback(null, defaulthappyresponse);
  }
}
