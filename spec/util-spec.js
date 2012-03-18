var Util = require('../lib/util');

describe("util", function(){

  //convention never dies I guess
  var subject = Util;

  describe(".format", function(){


    it("should replace placeholders with values", function(){
      expect(subject.format('{1} {0}', 'foo', 'bar')).to.be('bar foo');
    });

    //for now
    it("should fail on multiple replacements", function(){
      var result = subject.format(
        '{2} {1} {3} {2}', 'zero', '1', '-', '2'
      );

      //this may not be ideal but its probably
      //faster for this to fail. We only use
      //this utility for logging.
      expect(result).to.be(
        '- 1 2 {2}'
      );
    });

  });


});
