var fsPath = require('path'),
    Inheritance = require('./inheritance'),
    Variables = require('./variables'),
    Commands = {
      Mkdir: require('./commands/mkdir'),
      File: require('./commands/file')
    };

function Generator(config){
  var key;

  this.commandQueue = {};
  this.inheritance = new Inheritance(config.templatePaths);
  this.variables = new Variables();

  for(key in config){
    if(config.hasOwnProperty(key)){
      this[key] = config[key];
    }
  }

}


Generator.prototype = {

  LOG_FORMATS: {
    message: '{0}',
    path: '~> [ {0} ] - {1}',
    commandPath: '~> ({1}) [ {0} ] - {2}'
  },

  commandQueue: null,

  /**
   * Logger to use.
   *
   *
   * @property logger
   */
  logger: console.log,

  /**
   * Destination path for generator.
   *
   * @property target
   * @type String
   */
  target: null,

  /**
   * Interactive Mode?
   *
   *
   * @property interative
   * @type Boolean
   */
  interative: true,

  /**
   * Returns an absolute path given
   * a segment. Path is based on current `target`
   *
   *    gen = new Generator({ target: '/my/path' });
   *
   *    gen.targetPath('zomg.js'); // => /my/path/zomg.js
   *
   *
   * @return String
   */
  targetPath: function(rel){
    return fsPath.join(this.target, rel);
  },

  /**
   * Checks to see if path already exists in target dest.
   *
   * @param {String} path
   * @return Boolean
   */
  targetPathExists: function(path){
    return fsPath.existsSync(
      this.targetPath(path)
    );
  },

  /**
   * Returns an absolute url based on the path given.
   * The templatePaths will be searched until file is found
   * or false will be returned.
   *
   * Note: this delegates to the `.inheritance` object
   *
   * @param {String} path
   * @param {Function} callback arguments: (error, absolute path)
   */
  templatePath: function(path, callback){
    this.inheritance.find(path, callback);
  },

  /**
   * Unified logger for generator commands.
   * Log will differ based on the number of arguments passed.
   *
   * Will log to .logger which by default is console.log
   * See: LOG_FORMATS
   */
  log: function(path, message){
    var args = Array.prototype.slice.call(arguments),
        result, i, len;

    switch(args.length){
      case 2:
        result = this.LOG_FORMATS.path;
        break;
      case 3:
        result = this.LOG_FORMATS.commandPath;
        break;
      default:
        result = this.LOG_FORMATS.message;
        break;
    }

    for(i = 0, len = args.length; i < len; i++){
      result = result.replace('{' + i + '}', args[i]);
    }

    this.logger(result);
  },

  /**
   * Mkdir command creates a directory.
   *
   * @param {String} path
   */
  mkdir: function(path){
    var queue = this.commandQueue;

    //normalize
    path = fsPath.join(path, '/');

    if(typeof(queue.directories) === 'undefined'){
      queue.directories = {};
    }

    queue.directories[path] = new Commands.Mkdir(path, this);

    return this;
  },

  /**
   * File command copies a file.
   *
   * @param {String path}
   */
   file: function(path){
    var queue = this.commandQueue;

    if(typeof(queue.files) === 'undefined'){
      queue.files = {};
    }

    queue.files[path] = new Commands.File(path, this);

    return this;
   }


};

module.exports = exports = Generator;
