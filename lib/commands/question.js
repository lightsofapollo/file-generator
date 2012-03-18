var QuestionLib = require('../question');

function Question(variable, config, gen){
  this.gen = gen;
  this.variable = variable;
  this.question = new QuestionLib(config);
}

/**
 * Does not do anything just for api compat with
 * other commands.
 *
 * @param {Function} callback
 */
Question.prototype.check = function(callback){
  //always execute
  process.nextTick(function(){
    callback(null, true);
  });
};

/**
 *
 * Prompts user with question and saves 
 * result to variable name.
 *
 *
 * @param {Function} callback
 */
Question.prototype.execute = function(callback){
  var self = this;
  this.question.run(function(value){
    self.gen.variables.set(
      self.variable,
      value
    );

    callback();
  });
};




module.exports = exports = Question;
