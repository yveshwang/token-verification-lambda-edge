# token-verification-lambda-edge
A simple lambda function illustrating how one can verify JWT tokens as processed by AWS Lambda@Edge

# dependencies
You will need `docker` and `sam` via `node`.
See `package.json` and [getting started with aws sam local](https://github.com/awslabs/aws-sam-local#getting-started)

# how to..
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
sam local invoke "Edge" -e good_cred.json

# boo!
sam local invoke "Edge" -e bad_cred.json
```
# deployment

# license
MIT

# background
[Cloudfront event structure](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html)

[Cloudfront with Lambda@Edge](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
# author
Yves Hwang, 27.10.2017
