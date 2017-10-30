'use strict;'
const chai = require('chai');
var expect = chai.expect;
var tools = require('./../../src/tools.js');
const inputs =  [
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
                  {in: "/whatever/blah/#yoyo!%&%&^\"", ex: "/whatever/blah/#yoyo!%&%&%5E%22"},
                  {in: "/whatever/dothis?somethingweird", ex: "/whatever/dothis?somethingweird"},
                  {in: "      /whatever/", ex: "/whatever"},
                  {in: "  /   / whatever/      ", ex: "/whatever"},
                  {in: "////   ///   ////w h  atev  er    / ", ex: "/whatever"},
                  {in: "          /     ", ex: "/"},
                  {in: "/wHatevEr//", ex: "/whatever"},
                  {in: "  /   ///   /// /// ", ex: "/"}
                ];

describe('tools.normaliseURI tests', function() {
  function normaliseURITest(url, expected) {
    it("url "+url+" should equal "+expected, function() {
      var result = tools.normaliseURI(url);
      expect(result).to.equal(expected);
    });
  };
  inputs.map( x => { normaliseURITest(x.in, x.ex)  });
});
