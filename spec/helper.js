expect = require('expect.js');
sinon = require('sinon');

require('sinon-mocha').enhance(sinon);
expect = require('sinon-expect').enhance(expect, sinon, 'was');

specHelper = {

};


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

  helper.fs = {
    mkdir: mkdir
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
