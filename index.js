'use strict;'
const handle = require('./src/handle.js');
const tools = require('./src/tools.js');
const envar = require('envar');
const merge = require('deeply');
const clone = merge;

envar.defaults( {
  verbose: true,                              // verbose logging for this lambda
  urls: ['/verify'],                          // array of url to apply token verification
  secret: 'secret',                           // secret = shared secret used for the hmac value for this header
  headername: 'authorization',                // headername = name of the header to verify, usually lower case, following AWS Lambda Event structure
  audience: ['dk', 'no'],                     // aud = use locale as audience
  issuer: ['urn:companyname:productname'],    // iss = fixed issuer urn
  ignoreExpiration: false,                    // default to false, never ignoreExpiration
  ignoreNotBefore: false,                     // default to false, never ignoreNotBefore
  subject: 'id',                              // value could be id | payment which dictates if it is a identity token or payment token, or something else
  clockTolerance: 0,                          // default to 0;
  maxAge: '30d',                              // default to 30 days. we can always issue refresh token.
  clockTimestamp: null                        // use system time.
});

const verbose = envar('verbose');
handle.logverbose = verbose;

const options = [ {
  'urls': envar('urls'),
  'headername': envar('headername'),
  'secret': envar('secret'),
  'audience': envar('audience'),
  'issuer': envar('issuer'),
  'ignoreExpiration': envar('ignoreExpiration'),
  'ignoreNotBefore': envar('ignoreNotBefore'),
  'subject': envar('subject'),
  'clockTolerance': envar('clockTolerance'),
  'maxAge': envar('maxAge'),
  'clockTimestamp': envar('clockTimestamp')
}];
const printFriendlyOptions = clone(options);
printFriendlyOptions.map( x => {
  x.secret = "********";
});

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

function issue() {
  let payload = { "sub": "id",
    "aud": "no",
    "iss": "urn:companyname:productname",
    "nbf": 1509650575,
    "name": "John Doe",
    "admin": true,
    "exp": 9909651096,
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
  handle.log("config", JSON.stringify(printFriendlyOptions));
  handle.log("event_received", JSON.stringify(event));
  let uri = event.Records[0].cf.request.uri;
  let clientip = event.Records[0].cf.request.clientIp;
  handle.log("client_ip", clientip);
  handle.log("event_uri", uri);
  if (uri === '/issue') {
    handle.log("token_issue", "/issue");
    let token = issue();
    let response = JSON.parse(JSON.stringify(defaulthappyresponse));
    response.body = token;
    callback(null, response);
  } else if (uri === '/test') {
    handle.log("token_test", "/test");
    let token = issue();
    let response = null;
    let acceptedaud= ['dk', 'no'];
    let acceptedsub = "id";
    let acceptediss = "urn:companyname:productname";
    if( tools.verifyTokenJWT(token, 'secret', acceptedaud, acceptediss, false, false, acceptedsub, 0, '30d', null) ) {
      handle.log("token_test_auth", "/test");
      response = JSON.parse(JSON.stringify(defaulthappyresponse));
    } else {
      handle.log("token_test_unauth", "/test");
      response = JSON.parse(JSON.stringify(unauthorisedresponse));
    }
    response.body = token;
    callback(null, response);
  } else {
    var result = handle.processViewerRequest(event, unauthorisedresponse, options);
    handle.log("processed_viewer_request", JSON.stringify(result));
    let request = event.Records[0].cf.request;
    handle.log("request", JSON.stringify(request));
    if( result === unauthorisedresponse) {
      handle.log("unauth_return", JSON.stringify(unauthorisedresponse));
      callback(null, unauthorisedresponse);
    } else {
      handle.log("auth_return", JSON.stringify(request));
      callback(null, request);
    }
  }
}
