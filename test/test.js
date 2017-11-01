'use strict;'

const handle = require('./../src/handle.js');

function hellooo(something, blah) {
  console.log("hellooo");
}

handle.processViwerRequest({"something":"something"}, {"blah":"blah"}, hellooo);
