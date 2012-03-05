var commander = require('commander'),
    Question = require('../lib/question');

describe("question", function(){

  var subject, complete = {
    done: function(){}
  };

  function setup(config, callback){
    if(typeof(config) === 'undefined'){
      config = {};
    }

    if(!('prompt' in config)){
      config.prompt = 'foo ';
    }

    beforeEach(function(){
      subject = new Question(config);
      if(callback){
        callback();
      }
    });
  }

  function execute(value){
    if(typeof(value) === 'undefined'){
      value = 'val';
    }

    beforeEach(function(done){
      subject.run(function(value){
        complete.done(value);
        done();
      });

      process.stdin.emit('data', value);
    });
  }

  describe("when called as a function", function(){

    var subject;

    beforeEach(function(){
      sinon.stub(Question.prototype, 'run');

      subject = Question({
        prompt: 'foo '
      }, complete.done);
    });

    it("should create an instance of Question", function(){
      expect(subject).to.be.a(Question);
    });

    it("should execute run", function(){
      expect(subject.run).was.calledWith(complete.done);
    });

    it("should setup config", function(){
      expect(subject.prompt).to.be('foo ');
    });
  });

  describe(".run", function(){

    beforeEach(function(){
      sinon.spy(Question.prototype, 'simplePrompt');
    });

    describe("when given an array as .type", function(){
      setup({type: ['foo', 'bar']}, function(){
        sinon.stub(subject, 'choosePrompt', function(cb){
          cb('foo');
        });
      });

      execute();

      it("should call choosePrompt", function(){
        expect(subject.choosePrompt).was.called();
      });

    });

    describe("when given no type", function(){
      setup();
      execute();

      it("should call simplePrompt", function(){
        expect(subject.simplePrompt).was.called();
      });
    });
  });

  describe("prompts", function(){

    var value, stdoutLog;

    beforeEach(function(){
      value = '1';

      sinon.spy(Question.prototype, '_defaultValue');
      sinon.spy(Question.prototype, '_setupDefaultValue');
      sinon.spy(Question.prototype, '_filterValue');
      sinon.spy(complete, 'done');

      sinon.spy(commander, 'prompt');
      sinon.spy(commander, 'confirm');
      sinon.spy(commander, 'choose');

    });

    function hasHandledValue(){
      it("should have called _defaultValue", function(){
        expect(subject._defaultValue).was.calledWith(value);
      });

      it("should have called _filterValue", function(){
        expect(subject._filterValue).was.calledWith(value);
      });

      it("should have passed callback the value", function(){
        expect(complete.done).was.calledWith(value);
      });
    }

    function hasSetupPrompt(){

      hasHandledValue();

      it("should have called _setupDefaultValue", function(){
        expect(subject._setupDefaultValue).was.called();
      });

      it("should have passed callback the value", function(){
        expect(complete.done).was.calledWith(value);
      });
    }

    describe(".simplePrompt", function(){
      setup({ defaultValue: 'baz' }, function(){
        value = 'one';
      });

      execute('one');

      it("should have called prompt on commander", function(){
        expect(commander.prompt).was.calledWith(subject.prompt);
      });

      hasSetupPrompt();
    });


    describe(".choosePrompt", function(){
      beforeEach(function(){
        sinon.spy(process.stdout, 'write');
      });

      function hasSetupChoose(cb){
        setup({type: ['one', 'two'] }, cb);

        it("should write prompt to stdout", function(){
          expect(process.stdout.write).was.calledWith(subject.prompt);
        });
      }

      hasSetupChoose(function(){
        value = 'one';
      });

      execute('1');

      it("should call commander.choose with default value", function(){
        expect(commander.choose).was.calledWith(
          subject.type
        );
      });

      hasHandledValue();

    });

  });


  describe("._filterValue", function(){

    describe("without filter", function(){

      setup();

      it("should return given", function(){
        expect(subject._filterValue('foo')).to.be('foo');
      });

    });

    describe("with filter", function(){
      var filter, result;

      filter = sinon.stub().returns('- foo -');

      setup({filter: filter});

      beforeEach(function(){
        result = subject._filterValue('foo');
      });

      it("should run filter", function(){
        expect(subject.filter).was.called();
      });

      it("should apply filter to result", function(){
        expect(result).to.be('- foo -');
      });

    });

  });

  describe("._setupDefaultValue", function(){

    beforeEach(function(){
      sinon.stub(process.stdout, 'write');
    });

    describe("with no default", function(){

      setup();

      beforeEach(function(){
        subject._setupDefaultValue();
      });

      it("should not write to stdout", function(){
        expect(process.stdout.write).was.notCalled();
      });
    });

    describe("with default", function(){
      setup({ defaultValue: 'def' });

      beforeEach(function(){
        subject._setupDefaultValue();
      });

      it("should write to stdout", function(){
        expect(process.stdout.write).was.calledWith(
          " (default: 'def') "
        );
      });

    });

  });

  describe("._defaultValue", function(){


    describe("when there is a default value but one is given", function(){

      setup({defaultValue: 'foo'});

      it("should return the given value", function(){
        expect(subject._defaultValue('baz')).to.be('baz');
      });

    });

    describe("when there is no defaultValue and given is blank", function(){
      setup({});

      it("should return blank", function(){
        expect(subject._defaultValue('')).to.be('');
      });
    });

    describe("when defaultValue is set and value is blank", function(){
      setup({defaultValue: 'baz'});
      it("should return defaultValue", function(){
        expect(subject._defaultValue('')).to.be('baz');
      });
    });

  });

});
