'use strict;'
const chai = require('chai');
const expect = chai.expect;
const handle = require('./../../src/handle.js');

describe('handler.processViwerRequest tests', function() {
  it("simple test", function() {
    var result = handle.processViwerRequest(null, null);
    expect(result).to.equal("hello");
  });
});
