'use strict;'
const handle = require('./src/handle.js');
const tools = require('./src/tools.js');
const verbose = true;

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
  status: '401',
  statusDescription: 'Unauthorized',
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
  status: '200',
  statusDescription: 'OK',
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

function log(label, input) {
  if(verbose) {
    console.log(label + "=" + input);
  }
}
function issue() {
  let payload = { "sub": "id",
    "aud": "no",
    "iss": "urn:companyname:productname",
    "nbf": 1509650575,
    "name": "John Doe",
    "admin": true,
    "exp": 1609651096,
    "iat": 1509651096
  };
  let systime = Math.floor(Date.now() / 1000);
  payload.iat = systime;
  payload.exp = systime + 1000000000;
  payload.nbf = systime - 1000000;
  return tools.signTokenJWT(payload, 'secret', false);
}
/* export handler block for lmabda*/
exports.handler = (event, context, callback) => {
  log("event_received", JSON.stringify(event));
  let uri = event.Records[0].cf.request.uri;
  log("event_uri", uri);
  if (uri === '/issue') {
    log("token_issue", "/issue");
    let token = issue();
    let response = JSON.parse(JSON.stringify(defaulthappyresponse));
    response.body = token;
    callback(null, response);
  } else if (uri === '/test') {
    log("token_test", "/test");
    let token = issue();
    let response = null;
    let acceptedaud= ['dk', 'no'];
    let acceptedsub = "id";
    let acceptediss = "urn:companyname:productname";
    if( tools.verifyTokenJWT(token, 'secret', acceptedaud, acceptediss, false, false, acceptedsub, 0, '30d', null) ) {
      log("token_test_auth", "/test");
      response = JSON.parse(JSON.stringify(defaulthappyresponse));
    } else {
      log("token_test_unauth", "/test");
      response = JSON.parse(JSON.stringify(unauthorisedresponse));
    }
    response.body = token;
    callback(null, response);
  } else {
    var result = handle.processViewerRequest(event, unauthorisedresponse, options);
    log("processed_viewer_request", JSON.stringify(result));
    let request = event.Records[0].cf.request;
    log("request", JSON.stringify(request));
    if( result === unauthorisedresponse) {
      log("unauth_return", JSON.stringify(unauthorisedresponse));
      callback(null, unauthorisedresponse);
    } else {
      log("auth_return", JSON.stringify(request));
      callback(null, request);
    }
  }
}
