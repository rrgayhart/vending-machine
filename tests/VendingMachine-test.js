var expect = require('chai').expect;

var VendingMachine = require('../lib/VendingMachine.js');

describe('VendingMachine', function(){
  var subject;

  beforeEach(function(){
    subject = new VendingMachine();
  });

  describe('.selectButton', function(){
    context('when it is the first press', function(){
      it('it logs the last button pressed', function(){
        expect(subject.buttonQueue).to.equal('');
        subject.selectButton('A');
        expect(subject.buttonQueue).to.equal('A');
      });
    });
    context('when it is the second press', function(){
      xit('', function(){
        
      });
    });
  });
});



  //   context('when the button does not match a product', function(){
  //     xit('' function(){

  //     });
  //   });
  // });

  // describe('.insertCredit', function(){
  //   it('' function(){

  //   });
  // });

  // describe('.returnCredit', function(){
  //   xit('' function(){

  //   });
  // });