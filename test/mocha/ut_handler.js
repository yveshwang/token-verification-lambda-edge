'use strict;'
const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const handle = require('./../../src/handle.js');
const tools = require('./../../src/tools.js');

const requesteventjson = { // triggered by CF viewer request event or origin request event
  "Records": [
    {
      "cf": {
        "config": {
          "distributionId": "EDFDVBD6EXAMPLE"
        },
        "request": {
          "clientIp": "2001:0db8:85a3:0:0:8a2e:0370:7334",
          "method": "GET",
          "uri": "/picture.jpg",
          "querystring": "color=red&size=large",
          "headers": {
            "host": [
              {
                "key": "Host",
                "value": "d111111abcdef8.cloudfront.net"
              }
            ],
            "user-agent": [
              {
                "key": "User-Agent",
                "value": "curl/7.51.0"
              }
            ]
          }
        }
      }
    }
  ]
};
const responseventjson = { // triggered by CF viewer response or an origin response event
    "Records": [
        {
            "cf": {
                "config": {
                    "distributionId": "EDFDVBD6EXAMPLE",
                    "requestId": "xGN7KWpVEmB9Dp7ctcVFQC4E-nrcOcEKS3QyAez--06dV7TEXAMPLE=="
                },
                "request": {
                    "clientIp": "2001:0db8:85a3:0:0:8a2e:0370:7334",
                    "method": "GET",
                    "uri": "/picture.jpg",
                    "querystring": "SIzE=large&COLOR=red",
                    "headers": {
                        "host": [
                            {
                                "key": "Host",
                                "value": "d111111abcdef8.cloudfront.net"
                            }
                        ],
                        "user-agent": [
                            {
                                "key": "User-Agent",
                                "value": "curl/7.18.1"
                            }
                        ]
                    }
                },
                "response": {
                    "status": "200",
                    "statusDescription": "OK",
                    "headers": {
                        "server": [
                            {
                                "key": "Server",
                                "value": "MyCustomOrigin"
                            }
                        ],
                        "set-cookie": [
                            {
                                "key": "Set-Cookie",
                                "value": "theme=light"
                            },
                            {
                                "key": "Set-Cookie",
                                "value": "sessionToken=abc123; Expires=Wed, 09 Jun 2021 10:18:14 GMT"
                            }
                        ]
                    }
                }
            }
        }
    ]
};

function clone(json) {
  return JSON.parse(JSON.stringify(json));
}
function header(name, key, value) {
  return JSON.parse("[ {\"key\" : \"" + key + "\", \"value\" : \"" + value + "\" } ]");
}

function appendRequestToHeader(json, name, key, value) {
  let request = clone(json);
  request.Records[0].cf.request.headers[name]= header(name, key, value);
  return request;
}

describe('extract 1 bearer tokens.', function() {
  it("1Authorization: <token>", function() {
    let bearervalue = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUwOTUzOTM1MCwiaWF0IjoxNTA5NTM5MzUwfQ.bZRllqyhVovxDPmzhZd2UE2ecb7LTyKTCF3FoFdKUFI";
    let result = handle.extractBearerToken(bearervalue);
    expect(result).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUwOTUzOTM1MCwiaWF0IjoxNTA5NTM5MzUwfQ.bZRllqyhVovxDPmzhZd2UE2ecb7LTyKTCF3FoFdKUFI')
    //console.log(JSON.stringify(request, null, 2));
  });
});

describe('more than 1 Auth header parts', function() {
  it('Authorization: <token>, <token>', function() {
    let value = "Bearer mF_9.B5f-4.1JqM, Basic YXNkZnNhZGZzYWRmOlZLdDVOMVhk";
    let result = handle.extractBearerToken(value);
    expect(result).to.equal(null);
  });
});

describe('empty auth header value', function() {
  it('Authorization: ', function() {
    let value1 = "";
    expect( handle.extractBearerToken(value1)).to.equal(null);
    let value2 = " ";
    expect( handle.extractBearerToken(value2)).to.equal(null);
  });
  it("[ { key: \"Authorization\", value: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ\" } ]", function() {
    let headervalue = [ { key: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ' } ];
    let token = handle.extractBearerToken(headervalue[0].value);
    expect(token).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ');
    //console.log(headervalue);
    //console.log("value is: " + headervalue[0].value);
    //console.log("key is: "+ headervalue[0].key);
  });
});

describe('handler.processViwerRequest tests', function() {
  let bearervalue = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";
  let errorresponse = {
          statusCode: 401,
          headers: { "x-custom-header" : "naughty bad client" },
          body: "meh"
  };
  // function verifyTokenJWT(token, secret, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp) {
  function test(testevent, secret, errorresponse, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp) {
    testevent.Records[0].cf.request.uri = '/////Whatever';
    return handle.processViewerRequest(testevent, secret, errorresponse, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp);
  }
  it("normalise querystring and uri", function() {
    let event = clone(requesteventjson);
    let result = test(event);
    expect(result).to.equal(null);
    expect(event.Records[0].cf.request.querystring).to.equal('color=red&size=large');
    expect(event.Records[0].cf.request.uri).to.equal('/whatever');
    //expect(result).to.equal("hello");
  });
  it("normalise querystring and uri with valid bearer token", function() {
    let event = clone(requesteventjson);
    event = appendRequestToHeader(requesteventjson, 'authorization', 'Authorization', bearervalue);
    //console.log(JSON.stringify(event, null, 2));
    let result = test(event, 'secret', errorresponse, null, null, null, null, null, null, null, null);
    // null is ok. proceed per normal.
    expect(result).to.equal(null);
  });
  it("normalise querystring and uri with valid bearer token, wrong secret", function() {
    let event = clone(requesteventjson);
    event = appendRequestToHeader(requesteventjson, 'authorization', 'Authorization', bearervalue);

    let result = test(event, 'wrongsecret', errorresponse, null, null, null, null, null, null, null, null);
    expect(result).to.equal(errorresponse);
  });
  it("basic_good_cred.json", function() {
    let obj = JSON.parse(fs.readFileSync('./test/basic_good_cred.json', 'utf8'));
    //console.log(JSON.stringify(obj, null, 2));
    let result = test(obj, 'secret', errorresponse, null, null, null, null, null, null, null, null);
    expect(result).to.equal(null);
  });
  it("payload.data", function() {
    let payload = JSON.parse(fs.readFileSync('./test/payload.data', 'utf8'));
    let testtoken = tools.signTokenJWT(payload, 'secret', false);
    expect( tools.verifyTokenJWT(testtoken, 'secret', ['no', 'dk'], 'urn:companyname:productname', false, false, 'id', 0, '30d', null)).to.equal(true);
    //console.log(JSON.stringify(obj, null, 2));
    let event = clone(requesteventjson);
    let bearervalue = "Bearer " + testtoken;
    event = appendRequestToHeader(requesteventjson, 'authorization', 'Authorization', bearervalue);
    // console.log(JSON.stringify(event, null, 2));
    let result = test(event, 'secret', errorresponse, 'no', 'urn:companyname:productname', false, false, 'id', 0, '30d', null);
    expect(result).to.equal(null);
  });
  it("good_cred.json, with correct aud and iss and maxtime etc", function() {
    let obj = JSON.parse(fs.readFileSync('./test/good_cred.json', 'utf8'));
    //console.log(JSON.stringify(obj, null, 2));
    // example function verifyTokenJWT(token, secret, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp) {
    let result = test(obj, 'secret', errorresponse, 'no', 'urn:companyname:productname', false, false, 'id', 0, '30d', null);
    expect(result).to.equal(null);
  });
  it("check req-id, x-req-id, present in event", function() {
    let testreqid = 'xGN7KWpVEmB9Dp7ctcVFQC4E-nrcOcEKS3QyAez--06dV7TEXAMPLE==';
    let event = clone(requesteventjson);
    event = appendRequestToHeader(requesteventjson, 'authorization', 'Authorization', bearervalue);
    event.Records[0].cf.config.requestId = testreqid;
    let result = test(event, 'wrongsecret', errorresponse, null, null, null, null, null, null, null, null);
    expect(event.Records[0].cf.config.requestId).to.equal(testreqid);
    expect(event.Records[0].cf.request.headers['x-req-id'][0].value).equal(testreqid);
    expect(result).to.equal(errorresponse);
  });
  it("check req-id, x-req-id, not present in event", function() {
    let event = clone(requesteventjson);
    event = appendRequestToHeader(requesteventjson, 'authorization', 'Authorization', bearervalue);
    let result = test(event, 'wrongsecret', errorresponse, null, null, null, null, null, null, null, null);
    expect(event.Records[0].cf.config.requestId).to.equal(undefined);
    expect(event.Records[0].cf.request.headers['x-req-id'][0].value.length).to.equal(32); //32 char length for the md5 hash
    expect(result).to.equal(errorresponse);
  });
  it("check req-id, x-req-id, empty reqid present in event", function() {
    let event = clone(requesteventjson);
    event = appendRequestToHeader(requesteventjson, 'authorization', 'Authorization', bearervalue);
    let emptyvalue = "   ";
    event.Records[0].cf.config.requestId = emptyvalue;
    let result = test(event, 'wrongsecret', errorresponse, null, null, null, null, null, null, null, null);
    expect(event.Records[0].cf.config.requestId).to.equal(emptyvalue);
    expect(event.Records[0].cf.request.headers['x-req-id'][0].value.length).to.equal(32); //32 char length for the md5 hash
    expect(result).to.equal(errorresponse);
  });
});
