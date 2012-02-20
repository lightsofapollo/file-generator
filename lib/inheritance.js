var StepObject = require('step-object');

function Inheritance(paths){
  if(typeof(paths) === 'undefined'){
    paths = [];
  }

  this.paths = paths;
}


Inheritance.prototype.add = function(path){
  this.paths.push(path);
};

module.exports = exports = Inheritance;
