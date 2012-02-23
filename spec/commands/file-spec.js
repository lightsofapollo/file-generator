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

    specHelper.fs.write('index.js', contents);

    beforeEach(function(done){
      subject._moveTarget(done);
    });

    afterEach(function(){
      if(fsPath.existsSync(subject.targetBackupPath())){
        fs.unlinkSync(subject.targetBackupPath());
      }
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
    var expected = fs.readFileSync(dest + '/../tpl1/index.js', 'utf8'),
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
    var targetPath = dest + '/index.js',
        actual, expected = 'foo';

    beforeEach(function(done){
      fs.writeFileSync(targetPath, expected, 'utf8');

      subject._loadTarget(function(err, contents){
        actual = contents;
        done(err);
      });
    });

    afterEach(function(){
      fs.unlinkSync(targetPath);
    });

    it("should load contents of target file", function(){
      expect(actual).to.be(expected);
    });

  });

  describe("._promptForDelete", function(){

    var asking;

    function stubPrompt(result){
      sinon.stub(commander, 'prompt', function(ask, callback){
        asking = ask;
        process.nextTick(function(){
          callback(result);
        });
      });
    }

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
        expect(asking).to.contain('Overwrite');
        expect(asking).to.contain(subject.path);
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
    var targetPath = dest + '/index.js';

    describe("when they don't match", function(){

      beforeEach(function(){
        fs.writeFileSync(targetPath, 'foo', 'utf8');
      });

      afterEach(function(){
        fs.unlinkSync(targetPath);
      });

      it("should have the result as false (not same)", function(done){
        subject._checkTargetSame(function(err, result){
          expect(result).to.be(false);
          done(err);
        });
      });

    });

    describe("when they are the same", function(){

      var result,
          path;

      beforeEach(function(done){
        subject.output(function(err, contents){
          fs.writeFileSync(targetPath, contents, 'utf8');
          done(err);
        });
      });

      afterEach(function(){
        fs.unlinkSync(targetPath);
      });

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

});
