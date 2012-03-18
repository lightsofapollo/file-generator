var Generator = require('../../lib/generator'),
    QuestionCommand = require('../../lib/commands/question'),
    Question = require('../../lib/question');

describe("command/question", function(){

  var subject,
      generator,
      questionConfig = {
        prompt: 'foo? '
      };

  beforeEach(function(){
    generator = specHelper.factory.generator();
    subject = new QuestionCommand('myVar', questionConfig, generator);
  });

  describe("initializer", function(){


    it("should set .gen", function(){
      expect(subject.gen).to.be(generator);
    });

    it("should set .variable", function(){
      expect(subject.variable).to.be('myVar');
    });

    it("should set .question", function(){
      expect(subject.question).to.be.a(Question);
    });

    it("should pass .question.prompt through log formatter", function(){

      var keyName = subject.logPrefix + subject.variable;

      expect(subject.question.prompt).to.equal(
        generator.logFormat(keyName, 'foo? ')
      );
    });

  });

  describe(".check", function(){

    it("should always return true", function(done){
      subject.check(function(err, result){
        expect(result).to.be(true);
        done(err);
      });
    });

  });

  describe(".execute", function(){

    var value = 'foo';

    beforeEach(function(done){
      sinon.stub(subject.question, 'run', function(callback){
        callback(value);
      });

      subject.execute(done);
    });

    it("should call .question.run", function(){
      expect(subject.question.run).was.called();
    });

    it("should save variable with result", function(){
      expect(generator.variables.get(subject.variable)).to.be(value);
    });

  });


});



