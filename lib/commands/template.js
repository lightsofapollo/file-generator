var File = require('./file'),
    util = require('util'),
    fsPath = require('path'),
    ejs = require('ejs');

function Template(){
  var variables;
  File.apply(this, arguments);

  variables = this.gen.variables;

  this.getVariable = variables.get.bind(variables);
}

util.inherits(Template, File);

/**
 * Returns list of variables for template.
 *
 *
 * @return {Object}
 */
Template.prototype.variables = function(){
  return {
    __file: this.targetPath(),
    __dirname: fsPath.dirname(this.targetPath()),
    variable: this.getVariable,
    get: this.getVariable
  };
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
