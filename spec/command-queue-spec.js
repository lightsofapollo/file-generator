var CommandQueue = require('../lib/command-queue');

describe("command-queue", function(){

  var subject;

  function createCommand(){
    var command = {
      check: function(callback){
        process.nextTick(function(){
          var err = command.checkErr;
          callback(err, command.checkPass);
        });
      },

      execute: function(callback){
        process.nextTick(function(){
          var err = command.executeErr;
          callback(err, true);
        });
      }
    };

    command.checkPass = false;
    command.checkErr = null;
    command.executeErr = null;

    return command;
  }

  beforeEach(function(){
    subject = new CommandQueue();
  });

  describe("initialize", function(){
    it("should create .commands as an empty object", function(){
      expect(subject.commands).to.eql({});
    });

    it("should initialize .length at 0", function(){
      expect(subject.length).to.be(0);
    });
  });

  describe(".add", function(){

    var command = createCommand();

    beforeEach(function(){
      subject.add('foo', command);
    });

    it("should add a command to .commands", function(){
      expect(subject.commands.foo).to.be(command);
    });

    it("should increase length", function(){
      expect(subject.length).to.be(1);
    });
  });

  describe("._runCommand", function(){

    var command = createCommand();

    beforeEach(function(){
      sinon.spy(command, 'check');
      sinon.spy(command, 'execute');
    });

    describe("when .check passes", function(){

      beforeEach(function(done){
        command.checkPass = true;
        subject._runCommand(command, done);
      });

      it("should have invoked check", function(){
        expect(command.check).was.called();
      });

      it("should have invoked execute", function(){
        expect(command.execute).was.called();
      });
    });

    describe("when .check fails", function(){
      beforeEach(function(done){
        command.checkPass = false;
        subject._runCommand(command, done);
      });

      it("should invoke check", function(){
        expect(command.check).was.called();
      });

      it("should not invoke execute", function(){
        expect(command.execute).was.notCalled();
      });

    });

  });

  describe(".run", function(){

    var commandOne = createCommand(),
        commandTwo = createCommand();


    describe("when running an empty queue", function(){

      it("should execute without errors", function(done){
        subject.run(done);
      });

    });

    describe("when successful", function(){

      beforeEach(function(done){
        sinon.spy(subject, '_runCommand');

        subject.add('one', commandOne);
        subject.add('two', commandTwo);

        subject.run(done);
      });

      it("should call _runCommand for commandOne", function(){
        expect(subject._runCommand).was.calledWith(commandOne);
      });

      it("should call _runCommand for commandTwo", function(){
        expect(subject._runCommand).was.calledWith(commandTwo);
      });

    });

  });

});
