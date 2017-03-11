var expect = require('chai').expect;
var sinon = require('sinon');

var VendingMachine = require('../lib/VendingMachine.js');

describe('VendingMachine', function(){
  var subject, items;
  var defaultDepth = 8;
  var defaultWidth = 6;
  var sampleItem = {item: 'candy', cost: 2};
  var samplePendingPurchase = {'a1': sampleItem};

  beforeEach(function(){
    subject = new VendingMachine();
    items = [ {item: 'apple', cost: 2}, 
              { item: 'banana', cost: 1.25},
              { item: 'pear', cost: 2},
              { item: 'strawberry', cost: 1.75},
              { item: 'pineapple', cost: 2.5},
              { item: 'orange', cost: 1},
              { item: 'lime', cost: .5},
              { item: 'lemon', cost: 2},
              { item: 'guava', cost: 2},
              { item: 'mango', cost: 2},
              { item: 'lichee', cost: 2}
            ];
  });

  describe('.loadMachine', function(){
    context('when passed one item', function(){
      it('populates that item to the default depth', function(){
        var item = { item: 'Beef Jerky', cost: 2 };
        subject.loadMachine(item);
        var expectedItems = {'a1': { item: 'Beef Jerky', cost: 2, quantity: defaultDepth }};
        expect(subject.inventory).to.deep.equal(expectedItems);
      });
    });

    context('when passed multiple items', function(){                   
      it('populates all items to the default depth', function(){
        subject.loadMachine(items); 
        var expectedResult = items[0];
        expectedResult.quantity = defaultDepth;
        expect(subject.inventory['a1']).to.deep.equal(expectedResult);
      });

      it('populates all items to the default width', function(){
        subject.loadMachine(items);
        var preBreak = 'a' + defaultWidth; // 'a6'
        var preBreakOutput = items[defaultWidth - 1]
        preBreakOutput.quantity = defaultDepth;
        var postBreakOutput = items[defaultWidth];
        postBreakOutput.quantity = defaultDepth;
        expect(subject.inventory[preBreak]).to.deep.equal(preBreakOutput);
        expect(subject.inventory['b1']).to.deep.equal(postBreakOutput);
        expect(subject.inventory['b6']).to.equal(undefined);
      });
    });
  });

  describe('.selectButton', function(){
    context('when selected button is \'clear\'', function(){
      it('clears button selection', function(){
        subject.selectButton('f');
        expect(subject.buttonQueue).to.equal('f');
        subject.selectButton('clear');
        expect(subject.buttonQueue).to.equal('');
      });

      it('clears pending items', function(){
        subject.pendingPurchase = samplePendingPurchase;
        subject.selectButton('clear');
        expect(subject.pendingPurchase).to.equal(null);
      });

      it('does not return credits');
      it('does not reset accumulated credits');
    });

    context('when selected button is \'refund\'', function(){
      it('clears button selection');
      it('clears pending items');
      it('returns credits');
      it('resets accumulated credits');
    });

    context('when selected button is a letter or number', function(){
      it('it logs the last button pressed', function(){
        expect(subject.buttonQueue).to.equal('');
        subject.selectButton('A');
        expect(subject.buttonQueue).to.equal('A');
      });

      it('triggers the item search only if two buttons have been pressed', function(){
        var spy = sinon.spy(subject, 'itemSearch');
        subject.selectButton('a');
        expect(spy.called).to.equal(false);
        subject.selectButton('1');
        expect(spy.called).to.equal(true);
      });

      it('triggers beginSaleProcess if item is returned for selected button', function(){
        subject.loadMachine({item: 'Candy', cost: 1});
        var spy = sinon.spy(subject, 'beginSaleProcess');
        subject.selectButton('a');
        expect(spy.called).to.equal(false);
        subject.selectButton('1');
        expect(spy.called).to.equal(true);
      });

      it('clears button queue after item is purchased')
    });
  });

  describe('.itemSearch', function(){
    context('when the item is not found', function(){
      it('returns null', function(){
        var result = subject.itemSearch('A2');
        expect(result).to.equal(null);
      });
    });

    context('when the item is found', function(){
      beforeEach(function(){
        subject.loadMachine(items);
      });

      it('returns the item information', function(){
        subject.buttonQueue = 'a2';
        var result = subject.itemSearch();
        var expectedResult = {'a2': { item: 'banana', quantity: 8, cost: 1.25}};
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });

  describe('.beginSaleProcess', function(){
    context('when no pendingPurchase', function(){
      it('returns undefined', function(){
        expect(subject.beginSaleProcess()).to.equal(undefined);
      });
    });

    context('when pendingPurchase', function(){
      beforeEach(function(){
        var item = {item: 'Fig Newton', cost: 2};
        subject.loadMachine(item);
        subject.pendingPurchase = { 'a1': item };
      }); 

      context('if exact change', function(){
        beforeEach(function(){
          subject.credits = 2;
        });

        it('vends the item', function(){
          var spy = sinon.spy(subject, 'vendItem');
          subject.beginSaleProcess();
          expect(spy.called).to.equal(true);
        });

        it('clears the credits', function(){
          expect(subject.credits).to.equal(2);
          subject.beginSaleProcess();
          expect(subject.credits).to.equal(0);
        });

        it('clears the item queue', function(){
          subject.beginSaleProcess();
          expect(subject.pendingPurchase).to.equal(null);
        });
      });

      context('not enough cash', function(){
        beforeEach(function(){
          subject.credits = 1.25;
        });

        it('does not vend the item', function(){
          var spy = sinon.spy(subject, 'vendItem');
          subject.beginSaleProcess();
          expect(spy.called).to.equal(false);
        });

        it('does not clear the credits', function(){
          expect(subject.credits).to.equal(1.25);
          subject.beginSaleProcess();
          expect(subject.credits).to.equal(1.25);
        });

        xit('clears the item queue after 3 seconds', function(){
          subject.beginSaleProcess();
          expect(subject.pendingPurchase).to.equal(null);
        });
      });

      context('if too much cash', function(){
        beforeEach(function(){
          subject.credits = 2.25;
        });

        it('vends the item', function(){
          var spy = sinon.spy(subject, 'vendItem');
          subject.beginSaleProcess();
          expect(spy.called).to.equal(true);
        });

        it('clears the credits', function(){
          expect(subject.credits).to.equal(2.25);
          subject.beginSaleProcess();
          expect(subject.credits).to.equal(0);
        });

        it('clears the item queue', function(){
          subject.beginSaleProcess();
          expect(subject.pendingPurchase).to.equal(null);
        });

        it('returns the remaining credits', function(){
          var spy = sinon.spy(subject, 'returnCredit');

          subject.beginSaleProcess();
          
          expect(spy.called).to.equal(true);
          expect(spy.args[0][0]).to.equal(.25);
        });
      });
    });
  });

  describe('.insertCredit', function(){
    context('when currency is accepted', function(){
      it('adds the credit value to .credits', function(){
        expect(subject.credits).to.equal(0);
        subject.insertCredit(.25);
        expect(subject.credits).to.equal(.25);
        subject.insertCredit(1);
        expect(subject.credits).to.equal(1.25);
        subject.insertCredit(5);
        expect(subject.credits).to.equal(6.25);
      });

      context('if pendingPurchase', function(){
        xit('calls beginSaleProcess after 2 seconds', function(){
          // var spy = sinon.spy(subject, 'beginSaleProcess');
        });    
      })
    });

    context('when currency is not accepted', function(){
      it('returns the inserted credit', function(){
        var spy = sinon.spy(subject, 'returnCredit');
        expect(subject.credits).to.equal(0);
        subject.insertCredit(.25);
        expect(subject.credits).to.equal(.25);
        subject.insertCredit(.66);
        expect(subject.credits).to.equal(.25);
        expect(spy.called).to.equal(true);
        expect(spy.args[0][0]).to.equal(.66);
      });
    });
  });
});