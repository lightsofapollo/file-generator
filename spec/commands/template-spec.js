var fs = require('fs'),
    fsPath = require('path'),
    Template = require('../../lib/commands/template'),
    File = require('../../lib/commands/file');

describe("commands/template", function(){

  var path = 'index.js',
      dest = specHelper.factory.targetPath(),
      subject,
      generator;

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

  describe(".getVariable", function(){
    var getVariable;

    beforeEach(function(){
      getVariable = subject.getVariable;
      generator.variables.set('foo.bar', 'value');
    });

    it("should be bound to the context of variables", function(){
      expect(getVariable('foo.bar')).to.be('value');
    });

  });

  describe(".variables", function(){

    var result;

    beforeEach(function(){
      result = subject.variables();
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

    it("should set variable", function(){
      expect(result.variable).to.be(subject.getVariable);
    });

    it("should set get", function(){
      expect(result.get).to.be(subject.getVariable);
    });

  });

  describe(".output", function(){

    var expected = 'one two',
        actual,
        template = [
          "<%= get('local.one') %>",
          "<%= get('local.two') %>"
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
        'local.one': 'one',
        'local.two': 'two'
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
