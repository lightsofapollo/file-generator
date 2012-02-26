var Variables = require('../lib/variables');

describe("variables", function(){

  var subject;

  beforeEach(function(){
    subject = new Variables();
  });

  describe("initialization", function(){
    it("should create a blank object ._vars", function(){
      expect(subject._vars).to.eql({});
    });
  });

  describe(".set", function(){

    beforeEach(function(){
      subject.set('foo', 'one');
    });

    it("should set foo key with value 'one' in ._vars", function(){
      expect(subject._vars.foo).to.be('one');
    });

  });

  describe(".get", function(){

    beforeEach(function(){
      subject.set('foo', 'one');
    });

    it("should get set variable .foo from ._vars", function(){
      expect(subject.get('foo')).to.be('one');
    });
  });

  describe(".getAll", function(){
    var result,
        expected = {
          foo: 'one',
          bar: 'two'
        };

    beforeEach(function(){

      subject.set('foo', 'one').set('bar', 'two');

      result = subject.getAll();
    });

    it("should not return ._vars (same instance as the class uses)", function(){
      expect(result).not.to.be(subject._vars);
    });

    it("should return an object with the key,value paris set in class", function(){
      expect(result).to.eql(expected);
    });

  });

});
