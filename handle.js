'use strict;'

/* module block */
module.exports = {
  processViwerRequest: processViwerRequest
}

/* export handler block for lmabda*/
exports.handler = (event, context, callback) => {

  // 1. normalise uri
  // 2. normalise query string if applicable
  // 2. verify token where appropriate
  processViwerRequest(event, context, callback);
}

function processViwerRequest( event, context, callback) {
//  const request = event.Records[0].cf.request;
//  const response = event.Records[0].cf.response;
//  const reqheaders = request.headers;
  callback(null, null);
}
