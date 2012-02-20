var Generator = require('../lib/generator'),
    Mkdir = require('../lib/command/mkdir'),
    Inheritance = require('../lib/inheritance');

describe("generator", function(){

  var subject,
      dest =  __dirname + '/out',
      fsPath = require('path'),
      tplPaths = [__dirname + '/tpl1/'];

  beforeEach(function(){
    subject = new Generator({
      target: dest,
      templatePaths: tplPaths
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

    it("should crate commandQueue", function(){
      expect(subject.commandQueue).to.eql({});
    });

    it("should create .inheritance object", function(){
      expect(subject.inheritance).to.be.a(Inheritance);
    });

    it("should set .inheritance paths based on templatePaths", function(){
      expect(subject.inheritance.paths).to.eql(tplPaths);
    });

  });

  describe(".getAbsolutePath", function(){

    var expected = fsPath.join(dest, 'foo.js');

    it("should return an absolute path to a relative segment", function(){
      expect(subject.getAbsolutePath('foo.js')).to.be(expected);
    });

  });

  describe(".mkdir", function(){

    var queue, result;

    beforeEach(function(){
      result = subject.mkdir('foo');

      queue = subject.commandQueue.mkdir;
    });

    it("should create mkdir hash", function(){
      expect(queue).to.be.a("object");
    });

    it("should add a mkdir command instance", function(){
      //path normalization
      expect(queue['foo/']).to.be.a(Mkdir);
    });

    it("should have set .path in command to foo/", function(){
      expect(queue['foo/'].path).to.be('foo/');
    });

    it("should set .gen on command", function(){
      expect(queue['foo/'].gen).to.be(subject);
    });

    it("should be chainable", function(){
      expect(result).to.be(subject);
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
