function Variables(){
  this._vars = {};
}

Variables.prototype = {

  /**
   * Gets a key from the stored variables.
   *
   *
   * @param {String} key
   */
  get: function(key){
    return this._vars[key];
  },

  /**
   * Stores a variable.
   *
   * Accepts a key and value as two arguments
   * and a single object notation for batch sets.
   *
   * @param {String} key
   * @param {Objct} value
   */
  set: function(name, value){
    var objectKey;

    if(typeof(name) === 'object'){
      for(objectKey in name){
        if(name.hasOwnProperty(objectKey)){
          this.set(objectKey, name[objectKey]);
        }
      }
    } else {
      this._vars[name] = value;
    }

    return this;
  },

  /**
   * Returns all variables stored in class.
   *
   *
   * @return {Object}
   */
  getAll: function(){
    var result = {},
        key;

    for(key in this._vars){
      if(this._vars.hasOwnProperty(key)){
        result[key] = this._vars[key];
      }
    }

    return result;
  }

};

module.exports = exports = Variables;

