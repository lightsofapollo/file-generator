var Generator = require('../../lib/generator'),
    File = require('../../lib/commands/file'),
    fs = require('fs'),
    fsPath = require('path'),
    commander = require('commander');

describe("command/file-abstract", function(){

  var path = 'index.js',
      dest = specHelper.factory.targetPath(),
      subject,
      generator;

  specHelper.mockLogger.setup(this);

  beforeEach(function(){
    generator = specHelper.factory.generator();
    subject = new File(path, generator);
  });

  function lastLog(){
    var logs = specHelper.mockLogger.messages();
    return logs[logs.length - 1];
  }

  function stubPrompt(result){
    sinon.stub(commander, 'prompt', function(ask, callback){
      stubPrompt.asking = ask;
      process.nextTick(function(){
        callback(result);
      });
    });
  }

  describe("initialize", function(){

    it("should save first argument as .path", function(){
      expect(subject.path).to.be(path);
    });

    it("should save second argument as .gen", function(){
      expect(subject.gen).to.be(generator);
    });

  });


  describe("._moveTarget", function(){

    var contents = 'foo';

    specHelper.fs.write('out/index.js', contents);
    specHelper.fs.rm('out/index.js.bak');

    beforeEach(function(done){
      subject._moveTarget(done);
    });

    it("should create targetBackupPath", function(){
      expect(fsPath.existsSync(subject.targetBackupPath()));
    });

    it("should copy file contents to backup", function(){
      expect(fs.readFileSync(subject.targetBackupPath(), 'utf8')).to.be(contents);
    });

  });

  describe(".targetPath", function(){

    it("should should target (save to) path", function(){
      expect(subject.targetPath()).to.be(
        subject.gen.targetPath(subject.path)
      );
    });

  });

  describe(".targetBackupPath", function(){

    it("should equal targetPath + .bak", function(){
      expect(subject.targetBackupPath()).to.be(
        subject.targetPath() + subject.BACKUP_SUFFIX
      );
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

  describe(".getContents", function(){
    var expected = specHelper.fs.read('tpl1/index.js'),
        actual;

    beforeEach(function(done){
      subject.getContents(function(err, tpl){
        actual = tpl;
        done(err);
      });
    });

    it("should load template from fs", function(){
      expect(actual).to.eql(expected);
    });

    it("should save result to ._template", function(){
      expect(subject._template).to.be(expected);
    });

    describe("calling again after caching", function(){

      beforeEach(function(done){
        subject.getContents(function(err, tpl){
          actual = tpl;
          done(err);
        });
      });

      it("should load template from fs", function(){
        expect(actual).to.eql(expected);
      });

    });

  });

  describe("._loadTarget", function(){
    var actual, expected = 'foo';

    specHelper.fs.write('out/index.js', expected);

    beforeEach(function(done){
      subject._loadTarget(function(err, contents){
        actual = contents;
        done(err);
      });
    });

    it("should load contents of target file", function(){
      expect(actual).to.be(expected);
    });

  });

  describe("._promptForDelete", function(){

    beforeEach(function(){
      sinon.stub(subject, '_moveTarget', function(callback){
        process.nextTick(callback);
      });
    });

    describe("when prompt is true", function(){

      beforeEach(function(done){
        stubPrompt(true);
        subject._promptForDelete(done);
      });

      it("should ask user if they want to delete path", function(){
        expect(stubPrompt.asking).to.contain('Overwrite');
        expect(stubPrompt.asking).to.contain(subject.path);
      });

      it("should have called _moveTarget", function(){
        expect(subject._moveTarget).was.called();
      });

    });

    describe("when prompt is false", function(){

      beforeEach(function(done){
        stubPrompt(false);
        subject._promptForDelete(done);
      });

      it("should not have called _moveTarget", function(){
        expect(subject._moveTarget).was.notCalled();
      });

    });

  });

  describe("._checkTargetSame", function(){

    describe("when they don't match", function(){
      specHelper.fs.write('out/index.js', 'foo');

      it("should have the result as false (not same)", function(done){
        subject._checkTargetSame(function(err, result){
          expect(result).to.be(false);
          done(err);
        });
      });

    });

    describe("when they are the same", function(){

      var targetPath = dest + '/index.js',
          result,
          path;

      specHelper.fs.copy('tpl1/index.js', 'out/index.js');

      it("should have the result as true (same)", function(done){
        subject._checkTargetSame(function(err, result){
          expect(result).to.be(true);
          done(err);
        });
      });

    });

  });

  describe(".output", function(){

    var cb = function(){};

    beforeEach(function(){
      sinon.stub(subject, 'getContents');

      subject.output(cb);
    });

    it("should delegate call to getContents", function(){
      expect(subject.getContents).was.calledWith(cb);
    });
  });

  describe(".check", function(){

    var result;

    function runCheck(){
      beforeEach(function(done){
        subject.check(function(err, status){
          result = status;
          done();
        });
      });
    }

    describe("when path does not exist", function(){

      runCheck();

      it("should return true", function(){
        expect(result).to.be(true);
      });

    });

    describe("when the file exists and is the same", function(){

      specHelper.fs.copy('tpl1/index.js', 'out/index.js');

      beforeEach(function(){
        sinon.spy(subject, '_checkTargetSame');
      });

      runCheck();

      it("should call _checkTargetSame", function(){
        expect(subject._checkTargetSame).was.called();
      });

      it("should return true", function(){
        expect(result).to.be(true);
      });

    });

    describe("when file exists and is not the same", function(){
      specHelper.fs.write('out/index.js', 'foo');

      beforeEach(function(){
        sinon.spy(subject, '_moveTarget');
      });

      describe("when user declines prompt", function(){
        beforeEach(function(){
          stubPrompt(false);
        });

        runCheck();

        it("should return false", function(){
          expect(result).to.be(false);
        });

      });

      describe("when user accepts prompt", function(){
        specHelper.fs.rm('out/index.js.bak');

        beforeEach(function(){
          stubPrompt(true);
        });

        runCheck();

        it("should return true", function(){
          expect(result).to.be(true);
        });

        it("should move target", function(){
          expect(subject._moveTarget).was.called();
        });

      });

    });

    describe(".exectue", function(){
      specHelper.fs.rm('out/index.js');

      beforeEach(function(done){
        subject.exectue(done);
      });

      it("should save file to out/index", function(){
        expect(subject.pathExists()).to.be(true);
      });

      it("should have the same contents as the result of .output", function(done){
        var actual = fs.readFileSync(subject.targetPath(), 'utf8');

        subject.output(function(err, out){
          expect(actual).to.be(out);
          done();
        });
      });

    });

  });

});
