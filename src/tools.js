'use strict;'
const path = require('path');
const querystring = require('querystring');
const base64url = require('base64url');
const jwt = require('jsonwebtoken');
const normalize = require('normalize-url');
/* module block */
module.exports = {
  normaliseURI: normaliseURI,
  verifyToken: verifyToken,
  normaliseQuerystring: normaliseQuerystring
}

function normaliseURI(uri) {
  let lowercase = path.normalize(uri.trim().replace(/\s/g, "")).toLowerCase();
  if( lowercase.length >= 1 && lowercase.charAt(0) != '/') {
    //if the first char doesnt start with '/', append it
    lowercase = '/' + lowercase;
  }
  let normalized = normalize(lowercase,
    {
      stripFragment: false,
      normalizeProtocol: false,
      removeTrailingSlash: true
    });
    if( normalized === '' || normalized === ' ') {
      return '/';
    } else return normalized;
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
