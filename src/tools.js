'use strict;'
const consoleerr = false;
const encoding = 'utf8';
const secret = 'secret';
const defaultalg = "HS256";
const allowedalg = ["HS256", "HS384"];
const path = require('path');
const querystring = require('querystring');
const base64url = require('base64url');
const jwt = require('jsonwebtoken');
const normalize = require('normalize-url');
const jws = require('jws');

/* module block */
module.exports = {
  normaliseURI: normaliseURI,
  signTokenJWS: signTokenJWS,
  signTokenJWT: signTokenJWT,
  verifyTokenJWT: verifyTokenJWT,
  normaliseQuerystring: normaliseQuerystring
}

function normaliseURI(uri) {
  let lowercase = path.normalize(uri.trim().replace(/\s/g, "")).toLowerCase();
  if( lowercase.length >= 1 && lowercase.charAt(0) != '/') {
    //if the first char doesnt start with '/', append it
    lowercase = '/' + lowercase;
  }
  let normalized = normalize(lowercase, {
      stripFragment: false,
      normalizeProtocol: false,
      removeTrailingSlash: true });
  if( normalized === '' || normalized === ' ') return '/';
  else return normalized;
}

function signTokenJWS(header, payload) {
  // using jws implementation
  // header contains alg info if you wish to tweak it.
  let token = jws.sign( { header: header,
      payload: JSON.stringify(payload),
      secret: secret,
      encoding: encoding
    });
  return token;
}

function signTokenJWT(payload, secret, ignoreTimestamp) {
  // when we issue token with jsonwebtoken, default is that timetamp is included.
  // when we dont specify usetimestamp, it is then default to true.
  // default header is also HS256 and type is JWT
  let noTimestamp = true;
  if( ignoreTimestamp != undefined) {
    noTimestamp = ignoreTimestamp;
  }
  let token = jwt.sign(payload, secret, {noTimestamp:noTimestamp, algorithm: defaultalg, encoding: encoding});
  return token;
}

function verifyTokenJWT(token, secret, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp, jti) {
  try {
    var options = {"algorithms": defaultalg};
    if( typeof audience !== 'undefined' && audience !== null) {
      //The audience can be checked against a string,
      //a regular expression or a list of strings and/or regular expressions.
      //Eg: "urn:foo", /urn:f[o]{2}/, [/urn:f[o]{2}/, "urn:bar"]
      options.audience = audience;
    }
    if( typeof issuer === 'string' && issuer !== null) {
      options.issuer = issuer;
    }
    if( typeof ignoreExpiration === 'boolean' && ignoreExpiration !== null) {
      options.ignoreExpiration = ignoreExpiration;
    }
    if( typeof ignoreNotBefore === 'boolean' && ignoreNotBefore !== null) {
      options.ignoreNotBefore = ignoreNotBefore;
    }
    if( typeof subject === 'string' && subject !== null) {
      options.subject = subject;
    }
    if( typeof clockTolerance === 'number' && clockTolerance !== null) {
      // number of seconds to tolerate when checking the nbf and exp claims,
      // to deal with small clock differences among different servers
      options.clockTolerance = clockTolerance || 0; //default to 0
    }
    if( (typeof maxAge === 'string' || typeof maxAge === 'number') && maxAge !== null) {
      // the maximum allowed age for tokens to still be valid.
      // It is expressed in seconds or a string describing a time span zeit/ms.
      // Eg: 1000, "2 days", "10h", "7d"
      options.maxAge = maxAge;
    }
    if( typeof clockTimestamp === 'number' && clockTimestamp !== null) {
      options.clockTimestamp = clockTimestamp;
    }
    if( typeof jti === 'string' && jti !== null) {
      //check this string, for example use this for client ip
      options.jwtid = jti;
    }
    let decoded = jwt.verify(token, secret, options);
    return true;
  } catch(err) {
    if(consoleerr) console.log(err);
    return false;
  }
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
