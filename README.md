# token-verification-lambda-edge
A simple lambda function illustrating how one can verify JWT tokens as processed by AWS Lambda@Edge

# dependencies
You will need `docker` and `sam` via `node`.
See `package.json` and [getting started with aws sam local](https://github.com/awslabs/aws-sam-local#getting-started)

# processing requests
The `processViewerRequest` will perform the following:
  * normalise uri
  * normalise querystring
  * sprinkle headers for origin server

# origin request headers after processing
After `CF` and this lambda has processed a `Viewer` response, the following headers are added to the origin request:

  * `X-Req-Id`: unique request id to track the request. This can be matched to Cloudtrail's own `x-edge-request-id` in `Cloudwatch`.
  * `X-Forwarded-For`: where you will find `client.ip` for the origin
  * `CloudFront-Forwarded-Proto`: this is forwarded if we wish to cache differently based on protocol. See [header-caching based on protocol](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web-protocol)
  * `Cloudfront-Is-Desktop-Viewer`: boolean value for desktop detection
  * `CloudFront-Is-Mobile-Viewer`: boolean value for mobile detection
  * `CloudFront-Is-SmartTV-Viewer`: boolean value for smart tv detection
  * `CloudFront-Is-Tablet-Viewer`: boolena value for tablet detection
  * `CloudFront-Viewer-Country`: Country code in upper case based on [ISO_3166-1_alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

# edge side verification
In the presence of `Authorization` header, it is expected that the client sends a single valid [JWT](https://jwt.io/) token. The following are not supported:

  * multiple `Authorization` header values, delimited in any way shape or form
  * Insecure JWTs

# default header value
The following are used as defaults for jwt header.

  * `typ`: type of token. Default to `JWT`
  * `alg`: algorithm used. Default to `HS256`

# mandatory fields when issuing jwt
The following are mandatory fields, and suggestions for some of their uses are as follows. For the full standard, see [JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519):

  * `iss`: issuer. Adopt a URN convention. e.g. `urn:companyname:productname`
  * `sub`: subject. Adopt a static text. It is in the author's opinion that user id are to be avoided and kept as a non-registered claim
  * `aud`: audience. Consider using devices as "audience", or perhaps a combination of devices and geo-location. e.g. `android`
  * `exp`: expiration. Epoch time for when the token is to expire in seconds.
  * `nbf`: not before. Epoch time for when the token is not to be processed in seconds.
  * `iat`: issued at. Epoch time for when the token is issued in seconds.

# verification of jwt
When verifying the token, the following options can be specified. Note that time can be tweaked, not only as clock skews but to set a system time that differs vastly from the actual.

  * `secret`: secret for the `hmac` routine. Must match with the secret known to the issuer.
  * `audience`: an array of accepted string for audience. One of them must match the `aud` claim. e.g. `['dk', 'no']`.
  * `ignoreExpiration`: default is false. Not recommended to set this to `true`.
  * `ignoreNotBefore`: default is false. Not recommended to set this to `true`.
  * `subject`: Static text denoted the `sub` claim. This must match.
  * `clockTolerance`: a clock skew that is considered acceptable. Default is 0 and we rely on longer lived tokens with `exp` and `nbf`.
  * `maxAge`: maximum age for the token. Anything older is considered expired. Default is `30d`.
  * `clockTimestamp`: override system time clock with this value.

# how to
```
# install dependencies
npm install -g aws-sam-local
npm install

# run unit tests
npm test

# watch unit tests
npm run-script test-watch
```
# test against aws lambda@edge locally
```
# success!
sam local invoke "Edge" -e test/good_cred.json

# boo!
sam local invoke "Edge" -e test/bad_cred.json
```
# deployment

# license
MIT

# background
[Cloudfront event structure](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html)
[Cloudfront with Lambda@Edge](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
[Cloudfront custom headers](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/forward-custom-headers.html)
[Cloudfront custom origin request/response headers](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorCustomOrigin.html)

# author
Yves Hwang, 27.10.2017
