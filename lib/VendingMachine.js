function VendingMachine(){
  this.height = 8;
  this.width = 6;
  this.depth = 8;
  this.buttonQueue = '';
  this.inventory = {};
  this.credits = 0;
  this.acceptedVals = [.25, 1, 5];
}

VendingMachine.prototype.loadMachine = function(input){
  var load = loadItem.bind(this);
  var inputIsArray = Array.isArray(input);
  inputIsArray ?  input.forEach(load) : load(input);
};

VendingMachine.prototype.selectButton = function(key){
  if (key.match(/clear/)){ return this.handleClear() };
  this.buttonQueue += key;
  if (this.buttonQueue.length < 2) return;
  var item = this.itemSearch();
  this.pendingPurchase = item;
  this.beginSaleProcess();
};

VendingMachine.prototype.insertCredit = function(credit){
  this.credits += credit;
  if(!this.acceptedVals.includes(credit)) {
    return this.returnCredit(credit);
  }
};

// End User Interface

VendingMachine.prototype.handleClear = function(){
  this.buttonQueue = '';
  this.pendingPurchase = null;
};

VendingMachine.prototype.returnCredit = function(credit){
  this.credits -= credit;
  return credit;
};

VendingMachine.prototype.itemSearch = function(){
  var item = this.inventory[this.buttonQueue];
  var itemPayload = {};
  itemPayload[this.buttonQueue] = item;
  return item ? itemPayload : null;
};

VendingMachine.prototype.beginSaleProcess = function(){
  if(!this.pendingPurchase) return;
  var creditDiff = calcDiff(this.pendingPurchase, this.credits);
  if (creditDiff === 0) {
    handlePaidInFull.call(this);
  } else if(creditDiff > 0) {
    handleOverPay.call(this, creditDiff);
  } else {
    handleUnderPay.call(this);
  }
}

VendingMachine.prototype.vendItem = function(){
  // return item
  // adjust item count or clear item slot
};

VendingMachine.prototype.resetUI = function(){
  this.credits = 0;
  this.resetPendingPurchase();
};

VendingMachine.prototype.resetPendingPurchase = function(){
  this.pendingPurchase = null;
}

function calcDiff(purchase, credits){
  var item = purchase[Object.keys(purchase)[0]];
  return credits - item.cost;
}

function handlePaidInFull(){
  this.vendItem();
  this.resetUI();
}

function handleOverPay(creditDiff){
  this.vendItem();
  this.returnCredit(creditDiff);
  this.resetUI();
};

function handleUnderPay(){
  this.resetPendingPurchase();
};

function loadItem(payload){
  for(var a = 97; a < (97 + this.height); a++){
    var key = String.fromCharCode(a);
    for(var i = 1; i <= this.width; i++){
      if(!this.inventory[key + i]){
        return this.inventory[key + i] = formatItem(payload, this.depth);
      }
    }
  }
}

function formatItem(payload, depth){
  payload.quantity = payload.quantity || depth
  return payload;
}

module.exports = VendingMachine;