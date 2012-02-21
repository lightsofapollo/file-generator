var fs = require('fs'),
    Step = require('step');

function FileAbstract(path, gen){

  this.path = path;
  this.gen = gen;

}

FileAbstract.prototype = {

  /**
   * Saved template data.
   *
   * @property _template
   * @type String
   */
  _template: null,

  /**
   * Returns target (save to) path for this command.
   *
   * @return {String} save to path
   */
  targetPath: function(){
    return this.gen.targetPath(this.path);
  },

  /**
   * Loads target version of this template.
   * Used for 'same' comparison.
   *
   * @param {Function} callback arguments: err, contents
   */
  _loadTarget: function(callback){
    var path = this.targetPath();

    fs.readFile(path, 'utf8', callback);
  },

  /**
   * Checks if target version and output are the same
   *
   *
   * @param {Function} callback
   */
  _checkTargetSame: function(callback){
    var target, output,
        self = this;

    Step(
      function(){
        self._loadTarget(this);
      },

      function(err, contents){
        if(err){
          throw new Error(err);
        }

        target = contents;
        self.output(this);

      },

      function(err, contents){
        if(err){
          throw new Error(err);
        }

        output = contents;
        return (output === target);
      },

      callback
    );
  },

  /**
   * Checks to see if path already exists in target dest.
   *
   * @return Boolean
   */
  pathExists: function(){
    return this.gen.targetPathExists(this.path);
  },

  /**
   * Gets contents of file.
   * Uses template inheritance to find file.
   *
   * Contents will be cached multiple calls to this function
   * are safe.
   *
   * @param {Function} callback arguments: err, contents
   */
  getContents: function(callback){
    var self = this;

    if(this._template){
      process.nextTick(function(){
        callback(null, self._template);
      });

      return;
    }

    Step(
      function(){
        self.gen.templatePath(self.path, this);
      },
      function(err, path){
        if(!path){
          throw new Error('There is no template for: "' + self.path + "'");
        }

        fs.readFile(path, 'utf8', this);
      },
      function(err, contents){
        if(err){
          throw new Error(err);
        }

        self._template = contents;

        return contents;
      },
      callback
    );
  },

  /**
   * Retrieve output for execute.
   *
   * By default this call delegates to getContents.
   * Here for overriding by subclasses.
   *
   * @param {Function} callback
   */
  output: function(callback){
    this.getContents(callback);
  }

};


module.exports = exports = FileAbstract;
