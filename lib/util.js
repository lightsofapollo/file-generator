var Util = {

  /**
   * Similar to sprintf or Y.sub
   * does not handle multiple replacements
   * 
   *
   *      util.format('{0} {1} {0}', '-', 'hit');
   *      // will output => '- hit {0}'
   *
   * @param {String} format
   */
  format: function(){
    var args = Array.prototype.slice.call(arguments),
        template = args.shift(),
        i, length;

    for(i = 0, length = args.length; i < length; i++){
      template = template.replace('{' + String(i) + '}', args[i]);
    }

    return template;
  }

};

module.exports = exports = Util;
