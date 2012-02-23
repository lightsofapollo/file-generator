expect = require('expect.js');
sinon = require('sinon');

require('sinon-mocha').enhance(sinon);
expect = require('sinon-expect').enhance(expect, sinon, 'was');

specHelper = {

};


//factories / fixtures
(function(helper){
  var factory, Generator;

  factory = {

    _templatePaths: [
      __dirname + '/tpl1',
      __dirname + '/tpl2',
      __dirname + '/tpl3'
    ],

    targetPath: function(){
      return __dirname + '/out/';
    },

    templatePaths: function(){
      return factory._templatePaths;
    },

    generator: function(){
      //lazy load
      if(!Generator){
        Generator = require('../lib/generator');
      }

      return new Generator({
        templatePaths: factory.templatePaths(),
        target: factory.targetPath(),
        logger: helper.mockLogger
      });
    }

  };

  helper.factory = factory;

}(specHelper));

//file system helpers

(function(helper){

  var fs = require('fs'),
      fsPath = require('path');

  function mkdir(){

    path = fsPath.join.apply(fsPath, arguments);

    beforeEach(function(){
      if(!fsPath.existsSync(path)){
        fs.mkdirSync(path, '0755');
      }
    });

    afterEach(function(){
      fs.rmdirSync(path);
    });

  }

  function write(path, contents){
    //path is relative to spec/out
    path = fsPath.join(__dirname, 'out', path);

    beforeEach(function(){
      fs.writeFileSync(path, contents);
    });

    afterEach(function(){
      if(fsPath.existsSync(path)){
        fs.unlinkSync(path);
      }
    });
  }

  helper.fs = {
    mkdir: mkdir,
    write: write
  };

}(specHelper));

// Mock Logger
(function(helper){

  var messages = [];

  helper.mockLogger = function(msg){
    messages.push(msg);
  };

  helper.mockLogger.messages = function(){
    return messages;
  };

  helper.mockLogger.setup = function(ctx){

    ctx.beforeEach(function(){
      helper.mockLogger.clear();
    });

  };

  helper.mockLogger.clear = function(){
    messages.length = 0;
  };

}(specHelper));
