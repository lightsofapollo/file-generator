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

});
