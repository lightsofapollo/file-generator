fsPath = require('path');


describe("inheritance", function(){

  var subject,
      Inheritance = require('../lib/Inheritance'),
      paths = [
        __dirname + '/files/tpl1',
        __dirname + '/files/tpl2',
        __dirname + '/files/tpl3'
      ];

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

  describe(".find", function(){

    describe("finding a file", function(){
      var result, err;

      beforeEach(function(done){
        subject.paths = paths;
        subject.find('c.txt', function(error, found){
          result = found;
          err = error;
          done();
        });
      });

      it("should be under tpl3", function(){
        expect(result).to.eql(
          fsPath.join(__dirname, 'files', 'tpl3', 'c.txt')
        );
      });

      it("should not have an error", function(){
        expect(!!err).to.be(false);
      });

    });


  });


});
