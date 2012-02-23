var fs = require('fs'),
    fsPath = require('path'),
    Step = require('step'),
    commander = require('commander');

function File(path, gen){

  this.path = path;
  this.gen = gen;

}

File.prototype = {

  BACKUP_SUFFIX: '.bak',

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
   * Returns path to backup of target.
   * Used when "overwriting" an existing file
   *
   * @return String
   */
  targetBackupPath: function(){
    return this.targetPath() + this.BACKUP_SUFFIX;
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
   * Moves target to targetPath + '.bak'
   * NOTE: This will override old backup.
   * This is intentional at this point.
   *
   * @param {Function} callback
   * @private
   */
  _moveTarget: function(callback){
    var backup = this.targetBackupPath(),
        original = this.targetPath();

    Step(
      //Check back to see if its exists..
      function(){
        var next = this;
        fsPath.exists(backup, function(exists){
          next(null, exists);
        });
      },

      function(backupExists){
        if(backupExists){
          //KILL THE BACKUP!
          fs.unlink(backup, this);
        } else {
          return false;
        }
      },

      //Either we just deleted the backup or its gone anyway
      function(){
        //Rename the file to the backup's name
        fs.rename(original, backup, this);
      },

      callback
    );
  },

  /**
   * Ask user if they wish to remove
   * the target path if so then _moveTarget.
   *
   * @private
   * @param {Function) callback arguments: error, result (did user delete file)
   */
  _promptForDelete: function(callback){

    var self = this;

    commander.prompt(
      this.path + " exists. Overwrite file?",
      function(removeFile){
        Step(
          function(){
            if(removeFile){
              self._moveTarget(this);
            } else {
              return removeFile;
            }
          },

          function(){
            callback(null, removeFile);
          }
        );
      }
    );
  },

  /**
   * Checks if target version and output are the same
   *
   *
   * @param {Function} callback arguments: err, filesSame (boolean)
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
  },

  /**
   * Runs a number of checks to see if file already
   * exists.
   *
   * 1. File exists?
   * 2. Is the file the same?
   * 3. Ask to overwrite the file?
   *
   * @param {Function} callback arguments: err, success (boolean)
   */
  check: function(callback){

  },

  exectue: function(callback){

  }

};


module.exports = exports = File;
