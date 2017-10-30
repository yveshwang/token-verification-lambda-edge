'use strict;'
const chai = require('chai');
const secret = "secret";
var expect = chai.expect;
var tools = require('./../../src/tools.js');
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
  let header = {alg:"HS256",typ:"JWT"};
  let payload = {sub:"1234567890",name:"John Doe",admin:true};
  let expected = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";
  it(JSON.stringify(header) + " and " + JSON.stringify(payload) +
    " should hash to " + expected, function() {
      expect( tools.signTokenJWS(header, payload, secret)).to.equal(expected);
    });
});
