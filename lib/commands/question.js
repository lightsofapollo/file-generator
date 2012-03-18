var QuestionLib = require('../question');

function Question(variable, config, gen){
  var question;

  if(typeof(config) === 'undefined'){
    config = {};
  }

  this.gen = gen;
  this.variable = variable;

  question = this.question = new QuestionLib(config);

  if(question.prompt){
    question.prompt = this.gen.logFormat(
      variable, this.commandType, question.prompt
    );
  }
}

/**
 * Subject of this commands interest used for logging.
 *
 * @property commandType
 * @type String
 */
Question.prototype.commandType = 'variable';

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
