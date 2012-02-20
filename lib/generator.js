var fsPath = require('path');

function Generator(config){
  var key;

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
   *    gen.getAbsolutePath('zomg.js'); // => /my/path/zomg.js
   *
   *
   * @return String
   */
  getAbsolutePath: function(rel){
    return fsPath.join(this.target, rel);
  },

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
  }


};

module.exports = exports = Generator;
