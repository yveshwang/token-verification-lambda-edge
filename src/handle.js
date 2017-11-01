'use strict;'

/* module block */
module.exports = {
  processViwerRequest: processViwerRequest
}

function processViwerRequest( event, context) {
  // 1. normalise uri
  // 2. normalise query string if applicable
  // 2. verify token where appropriate

//  const request = event.Records[0].cf.request;
//  const response = event.Records[0].cf.response;
//  const reqheaders = request.headers;
  return "hello";
}
