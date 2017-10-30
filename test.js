'use strict;'

const handle = require('./handle.js');
const tools = require('./tools.js');
const jwt = require('jsonwebtoken');
const jws = require('jws');
const base64url = require('base64url');

function hellooo(something, blah) {
  console.log("hellooo");
}
function normaliseTest(url) {
  console.log(tools.normaliseURI(url));
}
function normaliseQueryTest(query) {
  console.log(tools.normaliseQuerystring(query));
}
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
//console.log(token);
var header = {alg:"HS256",typ:"JWT"};
var payload = {sub:"1234567890",name:"John Doe",admin:true};

function jwstest(header, payload){
  //header is the option object
  // function (payload, secretOrPrivateKey, options, callback)

  var token = jws.sign(
    { header: header,
      payload: JSON.stringify(payload),
      secret:"secret",
      encoding: 'utf8'
    });
  console.log(token);
}
function jwttest(header, payload) {
  var token = jwt.sign(payload, "secret", {noTimestamp:true});
  console.log(token);
}
function decode(header, payload) {
  var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";
  var decoded = jwt.verify(token, "secret");
  console.log(decoded);
  console.log(decoded.header);
  console.log(decoded.payload);
}
jwstest(header, payload);
jwttest(header, payload);
decode(header, payload);
handle.processViwerRequest({"something":"something"}, {"blah":"blah"}, hellooo);

normaliseTest("/");
normaliseTest("whatever");
normaliseTest("/whatever");
normaliseTest("//whatever");
normaliseTest("/WHATVER");
normaliseTest("/something#heyhey");

normaliseQueryTest("color=red&size=large");
normaliseQueryTest("size=large&color=red");
normaliseQueryTest("SIzE=large&COLOR=red");
