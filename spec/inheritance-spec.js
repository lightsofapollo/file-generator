describe("inheritance", function(){

  var subject,
      Inheritance = require('../lib/Inheritance');

  beforeEach(function(){
    subject = new Inheritance();
  });

  describe(".initialize", function(){

    describe("when given an array", function(){

      var paths = ['./foo', './bar'];

      beforeEach(function(){
        subject = new Inheritance(paths);
      });

      it("should save it as .paths", function(){
        expect(subject.paths).to.eql(paths);
      });

    });

  });

  describe(".add", function(){

    beforeEach(function(){
      subject.add('foo/');
    });

    it("should push path into .paths", function(){
      expect(subject.paths).to.contain('foo/');
    });

  });


});
