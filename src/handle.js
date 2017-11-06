'use strict;'

const tools = require('./tools.js');
const md5 = require('md5');
const empty = require('is-empty');
/* module block */
module.exports = {
  processViewerRequest: processViewerRequest,
  processOriginRequest: processOriginRequest,
  processOriginResponse: processOriginResponse,
  processViewerResponse: processViewerResponse,
  extractBearerToken: extractBearerToken
}

function processViewerRequest(event, secret, errorresponse, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp) {
  //normalise query string
  let request = event.Records[0].cf.request;
  let headers = request.headers;
  // forward cloudfront request id to origin and override any preset values here
  let reqid = event.Records[0].cf.config.requestId;
  let distroid = event.Records[0].cf.config.distributionId;
  if( reqid === null || reqid === undefined || empty(reqid.trim())) {
    reqid = md5(distroid + ":" + new Date().getTime());
  }
  headers['x-req-id'] = [{'key': 'X-Req-Id', 'value': reqid}];
  //normalise
  request.querystring = tools.normaliseQuerystring(request.querystring);
  request.uri = tools.normaliseURI(request.uri);

  //verify token if exists
  if( headers['authorization'] !== undefined && 0 < headers['authorization'].length ) {
    let token = extractBearerToken(headers['authorization'][0].value);
    if( !tools.verifyTokenJWT(token, secret, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp)) {
      //return error
      return errorresponse;
    }
  }

  // proceeds as normal
  return null;
}

function processOriginRequest(event) {

}

function processOriginResponse(event) {

}

function processViewerResponse(event) {

}

function extractBearerToken(authorizationheader) {
  //assume 1 part of the header only in the form of
  // Bearer <token>
  // anything else is not accepted.
  let parts = authorizationheader.split(' ');
  if( 2 !== parts.length) return null;
  if( 'Bearer' !== parts[0]) return null;
  return parts[1];
}
