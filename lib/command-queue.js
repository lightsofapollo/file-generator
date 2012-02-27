var Step = require('step');

/**
 * Command queue will execute
 * an object of commands.
 *
 * Commands are expected to be associated
 * with some path.
 *
 * Commands must have .check and .execute functions.
 *
 * @constructor
 * @class CommandQueue
 */
function CommandQueue(){
  this.commands = {};
  this.length = 0;
}

CommandQueue.prototype = {

  /**
   * Adds a command to the queue.
   *
   *
   * @param {String} path or key for uniqueness
   * @param {Object} command command
   */
  add: function(path, command){
    this.length += 1;
    this.commands[path] = command;
  },

  /**
   * Executes a single command.
   *
   * Will invoke the commands .check function
   * if the callback associated with .check returns
   * true will then invoke the .execute function on the command.
   *
   * @private
   * @param {Object} command
   * @param {Function} callack arguments: err
   */
  _runCommand: function(command, callback){
    command.check(function(err, success){
      if(err || !success){
        callback(err, success);
        return;
      }

      command.execute(function(err, result){
        callback(err, result);
      });
    });
  },

  /**
   * Runs every command in queue.
   * If a command throws an error the processing
   * will halt.
   *
   *
   * @param {Function} callback arguments: err
   */
  run: function(callback){
    var path, command, pending = 0,
        commands = [],
        self = this;

    if(this.length === 0){
      process.nextTick(function(){
        callback(null);
      });
      return;
    }

    //We want to invoke each command in order
    //without running two at the same time
    for(path in this.commands){
      if(this.commands.hasOwnProperty(path)){
        (function(command){
          commands.push(function(){
            self._runCommand(command, this);
          });
        }(this.commands[path]));
      }
    }

    commands.push(callback);
    Step.apply(Step, commands);
  }

};


module.exports = exports = CommandQueue;
