var Generator = require('../lib/generator');

describe("generator", function(){

  var subject,
      dest =  __dirname + '/out',
      fsPath = require('path');

  beforeEach(function(){
    subject = new Generator({
      target: dest
    });
  });

  describe(".logger", function(){
    it("should be console.log by default", function(){
      expect(subject.logger).to.be(console.log);
    });
  });


  describe("initialization", function(){

    it("should save config object as properties", function(){
      expect(subject.target).to.be(dest);
    });


  });

  console.log(this.beforeEach);


  describe(".getAbsolutePath", function(){

    var expected = fsPath.join(dest, 'foo.js');

    it("should return an absolute path to a relative segment", function(){
      expect(subject.getAbsolutePath('foo.js')).to.be(expected);
    });

  });

  describe(".log", function(){

    var msg;

    beforeEach(function(){
      msg = '';

      subject.logger = function(log){
        msg = log;
      };
    });

    //path, message
    describe("with two arguments", function(){
      it("should log out to console in expected format", function(){
        var expected = '~> [ foo/path.js ] - oops';

        subject.log('foo/path.js', 'oops');

        expect(msg).to.be(expected);
      });
    });

    //path, command, message
    describe("with three arguments", function(){
      it("should log out to console in expected format", function(){
        var expected = '~> (mkdir) [ foo/path.js ] - oops';

        subject.log('foo/path.js', 'mkdir', 'oops');

        expect(msg).to.be(expected);
      });
    });


    describe("with one argument", function(){
      it("should log out to console in expected format", function(){
        var expected = 'Make it happen';

        subject.log('Make it happen');

        expect(msg).to.be(expected);
      });
    });

  });


});
