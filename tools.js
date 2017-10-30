'use strict;'
const path = require('path');
const querystring = require('querystring');
const base64url = require('base64url');
const jwt = require('jsonwebtoken');

/* module block */
module.exports = {
  normaliseURI: normaliseURI,
  verifyToken: verifyToken,
  normaliseQuerystring: normaliseQuerystring
}

function normaliseURI(uri) {
  return path.normalize(uri).toLowerCase();
}

function verifyToken(expectedtoken, secret) {
  console.log(token);
  return "whatever";
}

function normaliseQuerystring(query) {
  // see http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html
  // in query string scenarios, the URI could look like /images/image.jpg?color=red&size=large
  // in reality, it is the same URI if color or size appears first or last, upper case or lower case
  const params = querystring.parse(query.toLowerCase());
  const sortedParams = {};
  Object.keys(params).sort().forEach(key => {
    sortedParams[key] = params[key];
  });
  return querystring.stringify(sortedParams);
}
