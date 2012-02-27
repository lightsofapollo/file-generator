var Mkdir = require('../../lib/commands/mkdir'),
    Generator = require('../../lib/generator'),
    fsPath = require('path'),
    fs = require('fs');

describe("command/mkdir", function(){

  var path = 'foo/',
      dest = specHelper.factory.targetPath(),
      subject,
      generator;

  beforeEach(function(){
    generator = specHelper.factory.generator();
    subject = new Mkdir(path, generator);
  });

  describe("initialize", function(){

    it("should save first argument as .path", function(){
      expect(subject.path).to.be(path);
    });

    it("should save second argument as .gen", function(){
      expect(subject.gen).to.be(generator);
    });

  });

  describe(".pathExists", function(){

    beforeEach(function(){
      sinon.spy(subject.gen, 'targetPathExists');
      subject.pathExists();
    });

    it("should call gen.targetPathExists with .path", function(){
      expect(subject.gen.targetPathExists).was.calledWith(
        subject.path
      );
    });

  });

  describe(".check", function(){

    var result, err;

    function setup(){
      beforeEach(function(done){
        subject.check(function(error, shouldExecute){
          err = error;
          result = shouldExecute;
          done();
        });
      });
    }

    describe("when path exists", function(){
      specHelper.fs.mkdir(dest, path);
      setup();

      it("should not have an error", function(){
        expect(err).to.be(null);
      });

      it("should send second argument as false", function(){
        expect(result).to.be(false);
      });

      it("should log that path already exists", function(){
        expect(specHelper.mockLogger.last()).to.contain(
          'already exists'
        );
      });

    });

    describe("when path exists", function(){
      setup();

      it("should not have an error", function(){
        expect(err).to.be(null);
      });

      it("should send second argument as true", function(){
        expect(result).to.be(true);
      });

    });
  });

  describe(".execute", function(){

    beforeEach(function(done){
      subject.execute(done);
    });

    afterEach(function(){
      if(subject.pathExists()){
        fs.rmdirSync(dest + path);
      }
    });

    it("should have created path", function(){
      expect(subject.pathExists()).to.be(true);
    });
	
    it("should have logged creation", function(){
      expect(specHelper.mockLogger.last()).to.contain('created');
    });

  });


});
