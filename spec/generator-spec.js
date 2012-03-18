var Generator = require('../lib/generator'),
    Mkdir = require('../lib/commands/mkdir'),
    File = require('../lib/commands/file'),
    Template = require('../lib/commands/template'),
    Question = require('../lib/commands/question'),
    Inheritance = require('../lib/inheritance'),
    CommandQueue = require('../lib/command-queue'),
    Variables = require('../lib/variables'),
    util = require('../lib/util');

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

    it("should create .queue.questions which is a commandQueue instance", function(){
      expect(subject.queue.questions).to.be.a(CommandQueue);
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
     * @param {String} name name passed to the command
     * @param {String} command command name like 'file'
     * @param {Object} classObject the class of the command
     * @param {String} queueName name of the queue command is in
     */
    function shouldBeACommand(name, command, classObject, queueName){

      beforeEach(function(){
        var commandArgs = [name],
            args = Array.prototype.slice(arguments);

        if(args.length > 4){
          commandArgs.concat(args.slice(4, args.length));
        }

        result = subject[command].apply(subject, commandArgs);
        queue = subject.queue[queueName].commands;
      });

      it("should add a " + command + " command instance", function(){
        expect(queue[name]).to.be.a(classObject);
      });

      it("should set .gen on command", function(){
        expect(queue[name].gen).to.be(subject);
      });

      it("should be chainable", function(){
        expect(result).to.be(subject);
      });
    }

    function shouldBeACommandWithPath(path, command, classObject, queueName){

      shouldBeACommand.apply(this, arguments);

      it("should have set .path in command to " + path, function(){
        expect(queue[path].path).to.be(path);
      });
    }

    describe(".mkdir", function(){
      shouldBeACommandWithPath('foo/', 'mkdir', Mkdir, 'directories');

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
      shouldBeACommandWithPath('index.js', 'file', File, 'files');
    });

    describe(".template", function(){
      shouldBeACommandWithPath('index.js', 'template', Template, 'files');
    });

    describe(".question", function(){

      var options = {
        prompt: 'foo'
      };

      shouldBeACommand('myVariable', 'question', Question, 'questions', options);
    });

  });

  describe(".logFormat", function(){
    var expected, result;

    //path, message
    describe("with two arguments", function(){
      it("should use .path log format", function(){
        expect(subject.logFormat('1', '2')).to.be(
          util.format(subject.LOG_FORMATS.path, '1', '2')
        );
      });
    });

    //path, command, message
    describe("with three arguments", function(){
      it("should use .commandPath log format", function(){
        expect(subject.logFormat('1', '2', '3')).to.be(
          util.format(subject.LOG_FORMATS.commandPath, '1', '2', '3')
        );
      });
    });


    describe("with one argument", function(){
      it("should use .message log format", function(){
        expect(subject.logFormat('1')).to.be(
          util.format(subject.LOG_FORMATS.message, '1')
        );
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
      sinon.spy(subject.queue.questions, 'run');
      sinon.stub(process.stdin, 'destroy');

      subject.run(done);
    });

    it("should destroy stdin on complete", function(){
      expect(process.stdin.destroy).was.called();
    });

    it("should run questions queue", function(){
      expect(subject.queue.questions.run).was.called();
    });

    it("should run directories queue", function(){
      expect(subject.queue.directories.run).was.called();
    });

    it("should run files queue", function(){
      expect(subject.queue.files.run).was.called();
    });

  });


});
