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
   *
   * @param {String} key
   * @param {Objct} value
   */
  set: function(key, value){
    this._vars[key] = value;
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

