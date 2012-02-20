var fsPath = require('path'),
    mkdirp = require('mkdirp');

function Mkdir(path, gen){
  this.path = path;
  this.gen = gen;
}


/**
 * Checks to see if path already exists in target dest.
 *
 * @return Boolean
 */
Mkdir.prototype.pathExists = function(){
  return fsPath.existsSync(
    this.gen.getAbsolutePath(this.path)
  );
};


/**
 * Runs a _check_ step to to allow command
 * an opportunity to ask user stuff...
 */
Mkdir.prototype.check = function(callback){
  var execute = !this.pathExists();

  this.gen.log(this.path, 'mkdir', 'already exists');

  callback(null, execute);
};

/**
 * Creates directory in file system.
 *
 *
 */
Mkdir.prototype.execute = function(callback){
  var self = this;

  mkdirp(this.gen.getAbsolutePath(this.path), function(){
    self.gen.log(this.path, 'mkdirp', 'created');
    callback(null, true);
  });

};


module.exports = exports = Mkdir;
