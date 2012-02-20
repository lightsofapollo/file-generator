var Mkdir = require('../../lib/command/mkdir'),
    Generator = require('../../lib/generator'),
    fsPath = require('path'),
    fs = require('fs');

describe("command/mkdir", function(){

  var path = 'foo/',
      dest = __dirname + '/../out/',
      subject,
      generator;

  specHelper.mockLogger.setup(this);

  beforeEach(function(){
    generator = new Generator({
      target: dest,
      logger: specHelper.mockLogger
    });
    subject = new Mkdir(path, generator);
  });

  function lastLog(){
    var logs = specHelper.mockLogger.messages();
    return logs[logs.length - 1];
  }

  describe("initialize", function(){

    it("should save first argument as .path", function(){
      expect(subject.path).to.be(path);
    });

    it("should save second argument as .gen", function(){
      expect(subject.gen).to.be(generator);
    });

  });

  describe(".pathExists", function(){

    var result;

    beforeEach(function(){
      sinon.spy(fsPath, 'existsSync');

      result = subject.pathExists();
    });

    it("should check existance of path in target", function(){
      expect(fsPath.existsSync).was.calledWith(
        generator.getAbsolutePath(path)
      );
    });

    it("should return false when path does not exist", function(){
      expect(result).to.be(false);
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
        expect(lastLog()).to.contain(
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
      expect(lastLog()).to.contain('created');
    });

  });


});
