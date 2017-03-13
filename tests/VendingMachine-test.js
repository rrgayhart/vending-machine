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
        var preBreakOutput = items[defaultWidth - 1];
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
      var action = function(){ subject.selectButton('clear'); };

      it('clears button selection', function(){
        subject.selectButton('f');
        expect(subject.buttonQueue).to.equal('f');
        action();
        expect(subject.buttonQueue).to.equal('');
      });

      it('clears pending items', function(){
        subject.pendingPurchase = samplePendingPurchase;
        action();
        expect(subject.pendingPurchase).to.equal(null);
      });

      it('does not return credits', function(){
        var spy = sinon.spy(subject, 'returnCredit');
        action();
        expect(spy.called).to.equal(false);
      });

      it('does not reset accumulated credits', function(){
        subject.credits = .25;
        action();
        expect(subject.credits).to.equal(.25);
      });
    });

    context('when selected button is \'refund\'', function(){
      var action = function(){ subject.selectButton('refund'); };

      it('clears button selection', function(){
        subject.selectButton('f');
        expect(subject.buttonQueue).to.equal('f');
        action();
        expect(subject.buttonQueue).to.equal('');
      });

      it('clears pending items', function(){
        subject.pendingPurchase = samplePendingPurchase;
        action();
        expect(subject.pendingPurchase).to.equal(null);
      });

      it('resets accumulated credits', function(){
        subject.credits = .25;
        action();
        expect(subject.credits).to.equal(0);
      });

      it('returns credits', function(){
        var spy = sinon.spy(subject, 'returnCredit');
        action();
        expect(spy.called).to.equal(true);        
      });
    });

    context('when selected button is a letter or number', function(){
      it('it logs the last button pressed', function(){
        expect(subject.buttonQueue).to.equal('');
        subject.selectButton('A');
        expect(subject.buttonQueue).to.equal('A');
      });

      it('triggers the processSaleRequest only if two buttons have been pressed', function(){
        var spy = sinon.spy(subject, 'processSaleRequest');
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

      it('clears button queue after item is purchased', function(){
        subject.loadMachine({item: 'Candy', cost: 1});
        subject.credits = 1;
        subject.selectButton('a');
        expect(subject.buttonQueue).to.equal('a');
        subject.selectButton('1');
        expect(subject.buttonQueue).to.equal('');
      });
    });
  });

  describe('.beginSaleProcess', function(){
    var action = function(){return subject.beginSaleProcess();};

    context('when no pendingPurchase', function(){
      it('returns undefined', function(){
        expect(action()).to.equal(undefined);
      });
    });

    context('when pendingPurchase', function(){
      beforeEach(function(){
        var item = {item: 'Fig Newton', cost: 2, quantity: 2};
        subject.loadMachine(item);
        subject.pendingPurchase = { 'a1': item };
      });

      context('if exact change', function(){
        beforeEach(function(){
          subject.credits = 2;
        });

        it('vends the item', function(){
          var spy = sinon.spy(subject, 'vendItem');
          action();
          expect(spy.called).to.equal(true);
        });

        it('clears the credits', function(){
          expect(subject.credits).to.equal(2);
          action();
          expect(subject.credits).to.equal(0);
        });

        it('adds the cost of the item to the bank', function(){
          expect(subject.bank).to.equal(0);
          action();
          expect(subject.bank).to.equal(2);
        });

        it('decrements the item inventory', function(){
          expect(subject.inventory['a1'].quantity).to.equal(2);
          action();
          expect(subject.inventory['a1'].quantity).to.equal(1);
        });

        it('clears the slot in the item inventory if item sold out', function(){
          expect(subject.inventory['a1'].quantity).to.equal(2);
          action();
          expect(subject.inventory['a1'].quantity).to.equal(1);
          subject.credits = 2;
          subject.pendingPurchase = { 'a1': subject.inventory['a1'] };
          action();
          expect(subject.inventory['a1']).to.equal(undefined);
        });

        it('clears the item queue', function(){
          subject.beginSaleProcess();
          expect(subject.pendingPurchase).to.equal(null);
        });
      });

      context('when not enough credits', function(){
        beforeEach(function(){
          subject.credits = 1.25;
        });

        it('does not vend the item', function(){
          var spy = sinon.spy(subject, 'vendItem');
          action();
          expect(spy.called).to.equal(false);
        });

        it('does not clear the credits', function(){
          expect(subject.credits).to.equal(1.25);
          action();
          expect(subject.credits).to.equal(1.25);
        });

        it('does not add the cost of the item to the bank', function(){
          expect(subject.bank).to.equal(0);
          action();
          expect(subject.bank).to.equal(0);
        });

        it('does not decrement the item inventory', function(){
          expect(subject.inventory['a1'].quantity).to.equal(2);
          action();
          expect(subject.inventory['a1'].quantity).to.equal(2);
        });
      });

      context('if too much cash', function(){
        beforeEach(function(){
          subject.credits = 2.25;
        });

        it('vends the item', function(){
          var spy = sinon.spy(subject, 'vendItem');
          action();
          expect(spy.called).to.equal(true);
        });

        it('adds the cost of the item to the bank', function(){
          expect(subject.bank).to.equal(0);
          action();
          expect(subject.bank).to.equal(2);
        });

        it('decrements the item inventory', function(){
          expect(subject.inventory['a1'].quantity).to.equal(2);
          action();
          expect(subject.inventory['a1'].quantity).to.equal(1);
        });

        it('clears the credits', function(){
          expect(subject.credits).to.equal(2.25);
          action();
          expect(subject.credits).to.equal(0);
        });

        it('clears the item queue', function(){
          action();
          expect(subject.pendingPurchase).to.equal(null);
        });

        it('returns the remaining credits', function(){
          var spy = sinon.spy(subject, 'returnCredit');

          action();
          
          expect(spy.called).to.equal(true);
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
      });
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