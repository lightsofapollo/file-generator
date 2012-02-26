var fs = require('fs'),
    fsPath = require('path'),
    Template = require('../../lib/commands/template'),
    File = require('../../lib/commands/file');

describe("commands/template", function(){

  var path = 'index.js',
      dest = specHelper.factory.targetPath(),
      subject,
      generator;

  specHelper.mockLogger.setup(this);

  beforeEach(function(){
    generator = specHelper.factory.generator();
    subject = new Template(path, generator);
  });

  it("should be an instanceof commands/file", function(){
    expect(subject).to.be.a(File);
  });

  describe("initializer", function(){
    it("should setup .gen", function(){
      expect(subject.gen).to.be(generator);
    });

    it("should setup .path", function(){
      expect(subject.path).to.be(path);
    });
  });

  describe(".variables", function(){

    var result;

    beforeEach(function(){
      generator.variables.set({
        firstName: 'One',
        lastName: 'Two'
      });

      result = subject.variables();
    });

    it("should include existing variables", function(){
      expect(result.firstName).to.eql('One');
      expect(result.lastName).to.eql('Two');
    });

    it("should set __dirname", function(){
      expect(result.__dirname).to.eql(
        fsPath.dirname(subject.targetPath())
      );
    });

    it("should set __file", function(){
      expect(result.__file).to.eql(
        subject.targetPath()
      );
    });

  });

  describe(".output", function(){

    var expected = 'one two',
        actual,
        template = [
          '<%= localOne %>',
          '<%= localTwo %>'
        ].join(' ');

    beforeEach(function(){
      //Mock out fs.readFile for index.js and use our fixture
      sinon.stub(subject, 'getContents', function(callback){
        process.nextTick(function(){
          callback(null, template);
        });
      });
    });

    beforeEach(function(done){

      generator.variables.set({
        localOne: 'one',
        localTwo: 'two'
      });

      subject.output(function(err, contents){
        actual = contents;
        done();
      });
    });

    it("should run getContents result through ejs and return result", function(){
      expect(actual).to.be(expected);
    });

  });

});
