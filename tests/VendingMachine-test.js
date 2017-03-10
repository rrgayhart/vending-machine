var expect = require('chai').expect;
var sinon = require('sinon');

var VendingMachine = require('../lib/VendingMachine.js');

describe('VendingMachine', function(){
  var subject;
  var defaultDepth = 8;
  var defaultWidth = 6;

  beforeEach(function(){
    subject = new VendingMachine();
  });

  describe('.loadMachine', function(){
    context('when passed one item', function(){
      it('populates that item to the default depth', function(){
        var item = 'Beef Jerky';
        subject.loadMachine(item);
        var expectedItems = {a1: [item, defaultDepth]};
        expect(subject.inventory).to.deep.equal(expectedItems);
      });
    });

    context('when passed multiple items', function(){
      var items = ['apple', 'banana', 'pear', 'strawberry', 'pineapple',
        'orange', 'lime', 'lemon', 'guava', 'mango', 'lichee'];
                   
      it('populates all items to the default depth', function(){
        subject.loadMachine(items); 
        expect(subject.inventory['a1']).to.deep.equal([items[0], defaultDepth]);
      });

      it('populates all items to the default width', function(){
        subject.loadMachine(items);
        var preBreak = 'a' + defaultWidth; // 'a6'
        var preBreakOutput = [items[defaultWidth - 1], defaultDepth];
        var postBreakOutput = [items[defaultWidth], defaultDepth];
        expect(subject.inventory[preBreak]).to.deep.equal(preBreakOutput);
        expect(subject.inventory['b1']).to.deep.equal(postBreakOutput);
        expect(subject.inventory['b6']).to.equal(undefined);
      });
    });
  });

  describe('.selectButton', function(){
    it('it logs the last button pressed', function(){
      expect(subject.buttonQueue).to.equal('');
      subject.selectButton('A');
      expect(subject.buttonQueue).to.equal('A');
    });

    it('triggers the item search only if two buttons have been pressed', function(){
      var spy = sinon.spy(subject, 'itemSearch');
      subject.selectButton('A');
      expect(spy.called).to.equal(false);
      subject.selectButton('2');
      expect(spy.called).to.equal(true);
    });
  });

  describe('.itemSearch', function(){
    context('when the item is found', function(){

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