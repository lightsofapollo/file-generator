var Generator = require('../lib/generator'),
    Mkdir = require('../lib/commands/mkdir'),
    File = require('../lib/commands/file'),
    Inheritance = require('../lib/inheritance'),
    Variables = require('../lib/variables');

describe("generator", function(){

  var subject,
      dest = specHelper.factory.targetPath(),
      fsPath = require('path'),
      tplPaths = specHelper.factory.templatePaths();

  beforeEach(function(){
    subject = specHelper.factory.generator();
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

    it("should create a .variables object", function(){
      expect(subject.variables).to.be.a(Variables);
    });

    it("should set .inheritance paths based on templatePaths", function(){
      expect(subject.inheritance.paths).to.eql(tplPaths);
    });

  });

  describe(".targetPath", function(){

    var expected = fsPath.join(dest, 'foo.js');

    it("should return an absolute path to a relative segment", function(){
      expect(subject.targetPath('foo.js')).to.be(expected);
    });

  });

  describe(".targetPathExists", function(){

    var result;

    beforeEach(function(){
      sinon.spy(fsPath, 'existsSync');

      result = subject.targetPathExists('foo/');
    });

    it("should check existance of path in target", function(){
      expect(fsPath.existsSync).was.calledWith(
        subject.targetPath('foo/')
      );
    });

    it("should return false when path does not exist", function(){
      expect(result).to.be(false);
    });

  });
  describe(".templatePath", function(){

    var cb = function(){};

    beforeEach(function(){
      sinon.stub(subject.inheritance, 'find');
      subject.templatePath('foo/', cb);
    });

    it("should delegate to inheritance.find", function(){
      expect(subject.inheritance.find).was.calledWith(
        'foo/', cb
      );
    });

  });

  describe(".mkdir", function(){

    var queue, result;

    beforeEach(function(){
      result = subject.mkdir('foo');

      queue = subject.commandQueue.mkdir;
    });

    it("should create mkdir object", function(){
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

  describe(".file", function(){

    var queue, result;

    beforeEach(function(){
      result = subject.file('index.js');

      queue = subject.commandQueue.files;
    });

    it("should create files object", function(){
      expect(queue).to.be.a("object");
    });

    it("should add a file command instance", function(){
      //path normalization
      expect(queue['index.js']).to.be.a(File);
    });

    it("should set .gen on command", function(){
      expect(queue['index.js'].gen).to.be(subject);
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
