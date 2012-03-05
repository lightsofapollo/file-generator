/* 
 * Notes about commander: 
 * While commander is awesome in some cases
 * is really not what I need for this abstraction.
 *
 * I really should contribute some patches back to commander
 * OR write my own library that only handles prompts.
 */
var program = require('commander');

/**
 * Asks a question
 *
 * Options:
 *
 * prompt: Question to ask user
 *         If has a trailing space single line prompt
 *         otherwise multi-line prompt ( as in commander )
 *
 * type: A javascript type like Number, Date or an array of values 
 *      (string by default)
 *
 * defaultValue: Default value for prompt does *NOT* work for a choice (array given as type)
 *
 * filter:  this option can be used to process the value from the user
 *          this must be a function and should return a value.
 *
 *
 * @param {Object} config
 * @param {Function} callback
 */
function Question(config, callback){
  var question, key;

  if(this instanceof Question){
    if(typeof(config) === 'undefined'){
      config = {};
    }

    for(key in config){
      //yes I am now in the habit of trusting
      //myself and others to know wtf they are passing
      //in as options.
      this[key] = config[key];
    }

  } else {
    question = new Question(config);
    question.run(callback);

    return question;
  }
}

Question.prototype = {

  /**
   * Prompt string
   *
   * @property prompt
   * @type String
   */
  prompt: null,

  /**
   * Prompt type
   *
   * @property type
   * @type {Object} an array of values, Boolean or Number.
   */
  type: null,

  /**
   * Default value
   *
   * @property defaultValue
   * @type String
   */
  defaultValue: null,

  /**
   * Filter function to call on value
   *
   *
   * @property filter
   * @type {Function}
   */
  filter: null,

  /**
   * Applies filter on value if a .filter is present.
   *
   *
   * @param {Object} value
   * @return {Object} filtered value or value if no filter.
   */
  _filterValue: function(value){
    if(this.filter){
      return this.filter(value);
    }

    return value;
  },

  /**
   * If .defaultValue is present outputs
   * a 'default' value message.
   * writes to stdout
   */
  _setupDefaultValue: function(){
    var value = this.defaultValue;

    if(value !== null && value !== undefined){
      process.stdout.write(" (default: '" + this.defaultValue +"') ");
    }
  },

  /**
   * Checks value if it is blank or falsy
   * return the .defaultValue (if defaultValue is present).
   *
   * @param {Object} value
   * @return {Object}
   */
  _defaultValue: function(value){
    var defaultVal = this.defaultValue;

    if(!value || value === ''){
      //if defaultValue is not set it will return value
      return defaultVal || value;
    }

    return value;
  },

  /**
   * Asks a user the question then
   * executes callback with their reply.
   *
   *
   * @param {Function} callback
   */
  run: function(callback){
    if(this.type instanceof Array){
      //choose
      this.choosePrompt(callback);
    } else {
      //prompt
      this.simplePrompt(callback);
    }
  },

  /**
   * Ask the user a multiple choice question.
   *
   * NOTE: Until commander.js adds support for default choice
   * we cannot implement default logic here...
   *
   * @param {Function} callback
   */
  choosePrompt: function(callback){
    var self = this,
        choices = this.type;

    process.stdout.write(this.prompt);
    process.stdout.write("\n");


    program.choose(choices, function(index){
      var value;

      value = choices[index];
      value = self._filterValue(self._defaultValue(value));
      callback(value);
    });
  },

  /**
   * Ask a user a simple question.
   *
   * @param {Function} callback
   */
  simplePrompt: function(callback){
    var self = this;

    program.prompt(this.prompt, function(value){
      value = self._filterValue(self._defaultValue(value));
      callback(value);
    });

    //output default value msg if available
    this._setupDefaultValue();
  }


};

module.exports = exports = Question;
