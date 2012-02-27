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
      __dirname + '/files/tpl1',
      __dirname + '/files/tpl2',
      __dirname + '/files/tpl3'
    ],

    targetPath: function(){
      return __dirname + '/files/out/';
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

  function relativePath(path){
    return fsPath.join(__dirname, 'files', path);
  }

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

    //So we use the original un-altered path
    rm(path);

    beforeEach(function(){
      fs.writeFileSync(relativePath(path), contents);
    });

  }

  function rm(path){
    path = relativePath(path);

    afterEach(function(){
      if(fsPath.existsSync(path)){
        fs.unlinkSync(path);
      }
    });
  }

  function read(path){
    return fs.readFileSync(relativePath(path), 'utf8');
  }

  function copy(from, to){
    write(to, read(from));
  }

  helper.fs = {
    mkdir: mkdir,
    write: write,
    rm: rm,
    read: read,
    copy: copy
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

  helper.mockLogger.last = function(){
    return messages[messages.length - 1];
  };
  
  helper.mockLogger.clear = function(){
    messages.length = 0;
  };
  
  beforeEach(function(){
    helper.mockLogger.clear();
  });

}(specHelper));
