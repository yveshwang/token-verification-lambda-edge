'use strict;'
const chai = require('chai');
const fs = require('fs');
const base64url = require('base64url');
const secret = "secret";
const header = {alg:"HS256",typ:"JWT"};
const payload = {sub:"1234567890",name:"John Doe",admin:true};
const bearertoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";
const expect = chai.expect;
const tools = require('./../../src/tools.js');
const uriInputs =  [
  {in: "/", ex: "/"},
  {in: "//", ex: "/"},
  {in: "////", ex: "/"},
  {in: "/whatever", ex: "/whatever"},
  {in: "/////whatever///////////", ex: "/whatever"},
  {in: "/WHATEVER", ex: "/whatever"},
  {in: "whatever", ex: "/whatever"},
  {in: "//what.ever", ex: "/what.ever"},
  {in: "/whatever/", ex: "/whatever"},
  {in: "/whatever/blah#yoyo", ex: "/whatever/blah#yoyo"},
  {in: "/whatever/blah#yoyo/", ex: "/whatever/blah#yoyo"},
  {in: "/whatever/blah/#yoyo!%&%&^\"", ex: "/whatever/blah/#yoyo!%&%&%5E%22"},
  {in: "/whatever/dothis?somethingweird", ex: "/whatever/dothis?somethingweird"},
  {in: "      /whatever/", ex: "/whatever"},
  {in: "  /   / whatever/      ", ex: "/whatever"},
  {in: "////   ///   ////w h  atev  er    / ", ex: "/whatever"},
  {in: "          /     ", ex: "/"},
  {in: "/wHatevEr//", ex: "/whatever"},
  {in: "  /   ///   /// /// ", ex: "/"}
];

const queryInputs = [
  {in: "color=red&size=large", ex: "color=red&size=large"},
  {in: "size=large&color=red", ex: "color=red&size=large"},
  {in: "SIzE=large&COLOR=red", ex: "color=red&size=large"}
];

describe('tools.normaliseURI tests', function() {
  function normaliseURITest(url, expected) {
    it("url " + url + " should equal " + expected, function() {
      var result = tools.normaliseURI(url);
      expect(result).to.equal(expected);
    });
  };
  uriInputs.map( x => { normaliseURITest(x.in, x.ex)  });
});

describe('tools.normaliseQuerystring', function() {
  function queryTest(query, expected) {
    it("query " + query + " should equal " + expected, function(){
      var result = tools.normaliseQuerystring(query);
      expect(result).to.equal(expected);
    });
  };
  queryInputs.map( x => { queryTest(x.in, x.ex)});
});

describe('tools.signTokenJWS', function() {
  it(JSON.stringify(header) + " and " + JSON.stringify(payload) +
    " should hash to " + bearertoken, function() {
    expect( tools.signTokenJWS(header, payload, secret)).to.equal(bearertoken);
  });
});

describe('tools.signTokenJWT', function() {
  it("ignoreTimestamp = true: " + JSON.stringify(header) + " and " + JSON.stringify(payload) +
    " should hash to " + bearertoken, function() {
    expect(tools.signTokenJWT(payload, secret, true)).to.equal(bearertoken);
  });
  it("ignoreTimestamp = false: " + JSON.stringify(header) + " and " + JSON.stringify(payload) +
    " should hash to " + bearertoken, function() {
    //TODO: maybe breaking the bdd dogma, but since it is timestamp based..
    expect(tools.signTokenJWT(payload, secret, false)).to.not.equal(bearertoken);
  });
});

describe('tools.verifyTokenJWT - functional test', function() {
  it("verify token basic test: " + JSON.stringify(header) + " and " + JSON.stringify(payload) +
    " should verify to " + bearertoken, function() {
    expect(tools.verifyTokenJWT(bearertoken, secret)).to.equal(true);
  });
  it("specify android as audience - correct case", function() {
    let testaud = 'android';
    let acceptedaud = ['ios', 'android'];
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,aud:testaud,iat:1509538192};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    let testhash = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImF1ZCI6ImFuZHJvaWQiLCJpYXQiOjE1MDk1MzgxOTJ9.0xN8TPqa_XMvRcuvkBdlW4k9QNbL6otW-Cir_fyt02U";
    expect(testtoken).to.equal(testhash);
    expect( tools.verifyTokenJWT(testtoken, secret, acceptedaud)).to.equal(true);
  });
  it("specify android as audience - incorrect case", function() {
    let testaud = 'windows';
    let acceptedaud = ['ios', 'android'];
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,aud:testaud,iat:1509538192};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, acceptedaud)).to.equal(false);
  });
  it("specify urn:circlekid issuer - correct case", function() {
    let testiss = 'urn:ck:circlekid';
    let acceptediss = [/urn:f[o]{2}/, 'spid', 'facebook', testiss];
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iss:testiss,iat:1509537509};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    let testhash = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlzcyI6InVybjpjazpjaXJjbGVraWQiLCJpYXQiOjE1MDk1Mzc1MDl9.7H6lES6iQa-gkUo2UB9Gye7sL2c-HxROlgGjhFASDH0";
    expect(testtoken).to.equal(testhash);
    expect( tools.verifyTokenJWT(testtoken, secret, null, "urn:ck:circlekid")).to.equal(true);
  });
  it("specify urn:circlekid issuer - incorrect case", function() {
    let testiss = 'urn:random:issuer';
    let acceptediss = [/urn:f[o]{2}/, 'spid', 'facebook', 'urn:ck:circlekid'];
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iss:testiss,iat:1509537509};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, "urn:ck:circlekid")).to.equal(false);
  });
  it("specify null audience in payload", function() {
    expect(tools.verifyTokenJWT(bearertoken, secret, null)).to.equal(true);
  });
  it("specify check expiration - expired", function() {
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:1509539350,iat:1509539350};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    let testhash = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUwOTUzOTM1MCwiaWF0IjoxNTA5NTM5MzUwfQ.bZRllqyhVovxDPmzhZd2UE2ecb7LTyKTCF3FoFdKUFI";
    expect(testtoken).to.equal(testhash);
    expect( tools.verifyTokenJWT(testtoken, secret)).to.equal(false);
  });
  it("specify check expiration - expired but ignored", function() {
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:1509539350,iat:1509539350};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    let testhash = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUwOTUzOTM1MCwiaWF0IjoxNTA5NTM5MzUwfQ.bZRllqyhVovxDPmzhZd2UE2ecb7LTyKTCF3FoFdKUFI";
    expect(testtoken).to.equal(testhash);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, true)).to.equal(true);
  });
  it("specify check expiration, expires later than issue", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat + 10;
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret)).to.equal(true);
  });
  it("specify check expiration, iat = exp", function() {
    let iat = Math.floor(Date.now() / 1000);
    let exp = iat;
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret)).to.equal(false);
  });
  it("specify nbf - dont process until 30 from issue.", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat + 10;
    let nbf = iat + 30; //dont process until 30 sec over
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret)).to.equal(false);
  });
  it("specify nbf - process as normal", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat + 10;
    let nbf = 0; //process immediately?
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret)).to.equal(true);
  });
  it("specify nbf - process as normal but expired", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat - 10;
    let nbf = 0; //process immediately?
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret)).to.equal(false);
  });
  it("specify nbf - dont process until 30 sec from issue but ignored", function() {
    let iat = Math.floor(Date.now() / 1000);
    let exp = iat + 10;
    let nbf = iat + 30; //dont process until 30 sec over
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, true)).to.equal(true);
  });
  it("specify nbf - dont process until 30 sec from issue but ignored, though it is expired", function() {
    let iat = Math.floor(Date.now() / 1000);
    let exp = iat - 10;
    let nbf = iat + 30; //dont process until 30 sec over
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, true)).to.equal(false);
  });
  it("specify nbf - dont process until 30 sec from issue but ignored, though it is expired but also ignored", function() {
    let iat = Math.floor(Date.now() / 1000);
    let exp = iat - 10;
    let nbf = iat + 30; //dont process until 30 sec over
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, true, true)).to.equal(true);
  });
  it("specify iat", function() {
    let iat = Math.floor(Date.now() / 1000);
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iat:iat};
    let hashvalue = base64url(JSON.stringify(testpayload));
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( testtoken).to.include(hashvalue);
    expect( tools.verifyTokenJWT(testtoken, secret)).to.equal(true);
  });
  it("specify sub and check it", function() {
    let testsub = '1234567890';
    let iat = Math.floor(Date.now() / 1000);
    let testpayload = {sub:testsub,name:"John Doe",admin:true,iat:iat};
    let hashvalue = base64url(JSON.stringify(testpayload));
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( testtoken).to.include(hashvalue);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, testsub)).to.equal(true);
  });
  it("specify sub and check it but fails", function() {
    let testsub = '1234567890';
    let iat = Math.floor(Date.now() / 1000);
    let testpayload = {sub:testsub,name:"John Doe",admin:true,iat:iat};
    let hashvalue = base64url(JSON.stringify(testpayload));
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( testtoken).to.include(hashvalue);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, 'nodiggity')).to.equal(false);
  });
  it("tolerant clocks check on nbf and exp here by 100 sec", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat - 99;  //shoudl already be expired 99 sec ago
    let nbf = iat + 100; //should be processed 100 sec later
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, 100)).to.equal(true);
  });
  it("0 tolerant on clock", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat - 99;  //shoudl already be expired 99 sec ago
    let nbf = iat + 100; //should be processed 100 sec later
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, 0)).to.equal(false);
  });
  it("negative number but yeilds 0 tolerant on clock", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat - 99;  //shoudl already be expired 99 sec ago
    let nbf = iat + 100; //should be processed 100 sec later
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, -0.000000001)).to.equal(false);
  });
  it("negative number but yeilds 0 tolerant on clock", function() {
    let iat = Math.floor(Date.now() / 1000);
    // bump expire by 10
    let exp = iat - 99;  //shoudl already be expired 99 sec ago
    let nbf = iat + 100; //should be processed 100 sec later
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,exp:exp,nbf:nbf,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, -0.000000001)).to.equal(false);
  });
  it("maxAge on iat 1h, default on 0 tolerance, token is within 1h range", function() {
    let iat = Math.floor(Date.now() / 1000) - 3599;
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, null, '1h')).to.equal(true);
  });
  it("maxAge on iat 1h, default on 0 tolerance, token is older than 1h range on the dot", function() {
    let iat = Math.floor(Date.now() / 1000) - 3600;
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, null, '1h')).to.equal(false);
  });
  it("clockTimestamp tweak, skew is 1 sec maxAge on iat 1h, default on 0 tolerance, token is issued within 1h range, result is true", function() {
    // the compare is as follows:
    // maxAgeTimestamp = iat + maxAge
    // so the check is:
    // clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0

    let systime = Math.floor(Date.now() / 1000);
    let tweakedtime = systime - 1; //adjust time by 1s to represent skewed issue clock
    let iat =  systime - 3600; //back date by 1h
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, null, '1h', tweakedtime)).to.equal(true);
  });
  it("clockTimestamp tweak, skew is 1 sec, maxAge on iat 1h, default on 0 tolerance, token is issued outside of 1h range, result is false", function() {
    let systime = Math.floor(Date.now() / 1000);
    let tweakedtime = systime - 1; //adjust time by 1s to represent skewed issue clock
    let iat =  systime - 3601; //back date by 1h
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, null, '1h', tweakedtime)).to.equal(false);
  });
  it("clockTimestamp tweak, skew is not adjusted, maxAge on iat 1h, default on 0 tolerance, token is issued within 1h range, result is false", function() {
    let systime = Math.floor(Date.now() / 1000);
    let tweakedtime = systime; //adjust time by 1s to represent skewed issue clock
    let iat =  systime - 3600; //back date by 1h
    let testpayload = {sub:"1234567890",name:"John Doe",admin:true,iat:iat};
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    expect( tools.verifyTokenJWT(testtoken, secret, null, null, null, null, null, null, '1h', tweakedtime)).to.equal(false);
  });
  it( "real use case.", function() {
    let sub = "id";
    let aud = "no";
    let iss = "urn:companyname:productname";
    let iat = 1509651096;
    let nbf = 1509650575;
    let exp = 1609651096;
    let testpayload = {sub:sub,aud:aud,iss:iss,nbf:nbf,name:"John Doe",admin:true,exp:exp,iat:iat};
    // console.log(testpayload);
    let testtoken = tools.signTokenJWT(testpayload, secret, false);
    // console.log(testtoken);
    let acceptedaud= ['dk', 'no'];
    let acceptedsub = "id";
    let acceptediss = iss;
    // function verifyTokenJWT(token, secret, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp) {
    expect( tools.verifyTokenJWT(testtoken, 'secret', acceptedaud, acceptediss, false, false, acceptedsub, 0, '30d', null)).to.equal(true);
  });
  it( "real use case from payload.data", function() {
    let obj = JSON.parse(fs.readFileSync('./payload.data', 'utf8'));
    //console.log(obj);
    let testtoken = tools.signTokenJWT(obj, secret, false);
    let acceptedaud= ['dk', 'no'];
    let acceptedsub = "id";
    let acceptediss = "urn:companyname:productname";
    // function verifyTokenJWT(token, secret, audience, issuer, ignoreExpiration, ignoreNotBefore, subject, clockTolerance, maxAge, clockTimestamp) {
    expect( tools.verifyTokenJWT(testtoken, 'secret', acceptedaud, acceptediss, false, false, acceptedsub, 0, '30d', null)).to.equal(true);
  });
});
