var Step = require('step'),
    fsPath = require('path');

function Inheritance(paths){
  if(typeof(paths) === 'undefined'){
    paths = [];
  }

  this.paths = paths;
}


Inheritance.prototype.add = function(path){
  this.paths.push(path);
};

/**
 * Attempts to find given path under .paths
 *
 *
 * @param {String} path
 * @param {Function} callback
 */
Inheritance.prototype.find = function(subpath, callback){
  var self = this;

  //NOTE: This is for async 'path exists'
  //this could be greatly simplified by using the sync
  //method and was partly done to see how it would look.
  Step(

    function(){
      var i = self.paths.length,
          group = this.group(),
          path;

      //search in reverse order
      while(i--){
        path = fsPath.join(self.paths[i], subpath);

        (function(path){
          var cb = group();
          //why? step assumes first argument is 'error'
          //fsPath.exists first argument is the result there
          //are no error cases I guess...
          fsPath.exists(path, function(match){
            var result = (match)? path : match;
            cb(null, result);
          });
        }(path));
      }
    },

    function(err, matches){
      var i = 0, len = matches.length;

      for(; i < len; i++){
        if(matches[i]){
          return matches[i];
        }
      }

      return false;

    },
    callback
  );
};

module.exports = exports = Inheritance;
