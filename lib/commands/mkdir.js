var fsPath = require('path'),
    mkdirp = require('mkdirp');

function Mkdir(path, gen){
  this.path = path;
  this.gen = gen;
}


/**
 * Subject of this commands interest used for logging.
 *
 * @property commandType
 * @type String
 */
Mkdir.prototype.commandType = 'directory';


/**
 * Checks to see if path already exists in target dest.
 *
 * @return Boolean
 */
Mkdir.prototype.pathExists = function(){
  return this.gen.targetPathExists(this.path);
};


/**
 * Runs a _check_ step to to allow command
 * an opportunity to ask user stuff...
 */
Mkdir.prototype.check = function(callback){
  var execute = !this.pathExists();

  if(!execute){
    this.gen.log(this.path, this.commandType, 'already exists');
  }

  callback(null, execute);
};

/**
 * Creates directory in file system.
 *
 *
 */
Mkdir.prototype.execute = function(callback){
  var self = this;

  mkdirp(this.gen.targetPath(this.path), function(){
    self.gen.log(self.path, self.commandType, 'was created');
    callback(null, true);
  });

};


module.exports = exports = Mkdir;
