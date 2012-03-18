var fsPath = require('path'),
    colors = require('colors'),
    util = require('./util'),
    Step = require('step'),
    Inheritance = require('./inheritance'),
    Variables = require('./variables'),
    CommandQueue = require('./command-queue'),
    Commands = {
      Mkdir: require('./commands/mkdir'),
      File: require('./commands/file'),
      Template: require('./commands/template'),
      Question: require('./commands/question')
    };

function Generator(config){
  var key;

  this.queue = {
    files: new CommandQueue(),
    directories: new CommandQueue(),
    questions: new CommandQueue()
  };

  this.inheritance = new Inheritance(config.templatePaths);
  this.variables = new Variables();

  for(key in config){
    if(config.hasOwnProperty(key)){
      this[key] = config[key];
    }
  }

}

var LOG_FORMATS = {
  path: [
    '{0}'.cyan,
    '-',
    '{1}'
  ].join(' '),

  commandPath: [
    '({1})'.green,
    '', '{0}'.cyan,
    '-',
    '{2}'
  ].join(' ')

};

Generator.prototype = {

  LOG_FORMATS: {
    message: '{0}',
    path: LOG_FORMATS.path,
    commandPath: LOG_FORMATS.commandPath
  },

  queue: null,

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
   *
   */
  logFormat: function(path, message){
    var args = Array.prototype.slice.call(arguments),
        format;

    switch(args.length){
      case 2:
        format = this.LOG_FORMATS.path;
        break;
      case 3:
        format = this.LOG_FORMATS.commandPath;
        break;
      default:
        format = this.LOG_FORMATS.message;
        break;
    }

    args.unshift(format);

    return util.format.apply(null, args);
  },

  /**
   * Passes arguments through logFormat and
   * calls .logger.
   *
   */
  log: function(){
    this.logger(
      this.logFormat.apply(this, arguments)
    );
  },

  /**
   * Mkdir command creates a directory.
   *
   * @param {String} path
   */
  mkdir: function(path){
    var queue = this.queue;

    //normalize
    path = fsPath.join(path, '/');

    queue.directories.add(path, new Commands.Mkdir(path, this));

    return this;
  },

  /**
   * File command copies a file.
   *
   * @param {String} path
   */
  file: function(path){
    this.queue.files.add(path, new Commands.File(path, this));

    return this;
   },

  /**
   * Processes a file with ejs
   *
   * @param {String} path
   */
  template: function(path){
    this.queue.files.add(path, new Commands.Template(path, this));

    return this;
  },

  /**
   * Asks a user a question and saves
   * value in a variable.
   *
   * Options are from the lib/question.js class
   *
   * @param {String} variable name of the variable
   * @param {Object} options options for the question object.
   */
  question: function(variable, options){
    var command = new Commands.Question(variable, options, this);

    this.queue.questions.add(variable, command);

    return this;
  },

  /**
   * Executes generator commands.
   *
   *
   * @param {Function} done
   */
  run: function(callback){
    var queue = this.queue;

    function runQueue(queue){
      return function(){
        queue.run(this);
      };
    }

    Step(
      runQueue(queue.questions),
      runQueue(queue.directories),
      runQueue(queue.files),

      function(err){
        if(err){
          throw new Error(err);
        }

        process.stdin.destroy();

        return true;
      },

      callback
    );
  }

};

module.exports = exports = Generator;
