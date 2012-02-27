var Generator = require('../lib/generator'),
    Mkdir = require('../lib/commands/mkdir'),
    File = require('../lib/commands/file'),
    Template = require('../lib/commands/template'),
    Inheritance = require('../lib/inheritance'),
    CommandQueue = require('../lib/command-queue'),
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

    it("should create .queue", function(){
      expect(subject.queue).to.be.a('object');
    });

    it("should create .queue.files which is a commandQueue instance", function(){
      expect(subject.queue.files).to.be.a(CommandQueue);
    });

    it("should create .queue.directories which is a commandQueue instance", function(){
      expect(subject.queue.directories).to.be.a(CommandQueue);
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

  describe("commands", function(){

    // available for customization of command specs
    var queue, result;

    /**
     * Generates basics for a command spec.
     *
     * @param {String} path path passed to the command
     * @param {String} command command name like 'file'
     * @param {Object} classObject the class of the command
     * @param {String} queueName name of the queue command is in
     */
    function shouldBeACommand(path, command, classObject, queueName){

      beforeEach(function(){
        result = subject[command](path);
        queue = subject.queue[queueName].commands;
      });

      it("should add a " + command + " command instance", function(){
        //path normalization
        expect(queue[path]).to.be.a(classObject);
      });

      it("should have set .path in command to " + path, function(){
        expect(queue[path].path).to.be(path);
      });

      it("should set .gen on command", function(){
        expect(queue[path].gen).to.be(subject);
      });

      it("should be chainable", function(){
        expect(result).to.be(subject);
      });
    }

    describe(".mkdir", function(){
      shouldBeACommand('foo/', 'mkdir', Mkdir, 'directories');

      describe("with path normalization", function(){
        beforeEach(function(){
          subject.mkdir('foo');
        });

        it("should have set .path in command to foo/", function(){
          expect(queue['foo/'].path).to.be('foo/');
        });

      });
    });

    describe(".file", function(){
      shouldBeACommand('index.js', 'file', File, 'files');
    });

    describe(".template", function(){
      shouldBeACommand('index.js', 'template', Template, 'files');
    });

  });

  describe(".logFormat", function(){
    var expected, result;

    //path, message
    describe("with two arguments", function(){
      it("should log out to console in expected format", function(){
        expected = '~> [ foo/path.js ] - oops';
        result = subject.logFormat('foo/path.js', 'oops');

        expect(result).to.be(expected);
      });
    });

    //path, command, message
    describe("with three arguments", function(){
      it("should log out to console in expected format", function(){
        expected = '~> (mkdir) [ foo/path.js ] - oops';
        result = subject.logFormat('foo/path.js', 'mkdir', 'oops');

        expect(result).to.be(expected);
      });
    });


    describe("with one argument", function(){
      it("should log out to console in expected format", function(){
        expected = 'Make it happen';
        result = subject.logFormat('Make it happen');

        expect(result).to.be(expected);
      });
    });

  });

  describe(".log", function(){

    beforeEach(function(){
      sinon.spy(subject, 'logFormat');
      sinon.spy(subject, 'logger');

      subject.log('1', '2', '3', '4');
    });

    it("should get log string by calling log format", function(){
      expect(subject.logFormat).was.calledWith('1', '2', '3', '4');
    });

    it("should pass output of logFormat to .logger", function(){
      expect(subject.logger).was.calledWith(subject.logFormat(
        '1', '2', '3', '4'
      ));
    });

  });

  describe(".run", function(){

    beforeEach(function(done){
      sinon.spy(subject.queue.files, 'run');
      sinon.spy(subject.queue.directories, 'run');

      subject.run(done);
    });

    it("should run directories queue", function(){
      expect(subject.queue.directories.run).was.called();
    });

    it("should run files queue", function(){
      expect(subject.queue.files.run).was.called();
    });

  });


});
