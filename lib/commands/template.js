var File = require('./file'),
    util = require('util'),
    fsPath = require('path'),
    ejs = require('ejs');

function Template(){
  File.apply(this, arguments);
}

util.inherits(Template, File);

/**
 * Returns list of variables for template.
 *
 *
 * @return {Object}
 */
Template.prototype.variables = function(){
  var variables = this.gen.variables.getAll();

  /* Per Command Variables */
  variables.__file = this.targetPath();
  variables.__dirname = fsPath.dirname(variables.__file);

  return variables;
};

/**
 * Runs template through erb and returns result in callback.
 *
 *
 * @param {Function} callback arguments: err, output
 * @chainable
 */
Template.prototype.output = function(callback){
  var self = this;

  this.getContents(function(err, template){
    var output;
    if(err){
      callback(err, null);
      return;
    }

    output = ejs.render(template, self.variables());
    callback(null, output);
  });
};


module.exports = exports = Template;
