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
  if (key.match(/clear/)){ return this.processClear() };
  if (key.match(/refund/)){ return this.processRefund() };

  this.buttonQueue += key;
  if (this.buttonQueue.length === 2) { this.processSaleRequest(); }
};

VendingMachine.prototype.insertCredit = function(credit){
  this.credits += credit;
  if(!this.acceptedVals.includes(credit)) {
    return this.returnCredit(credit);
  }
};

// End User Interface

VendingMachine.prototype.processClear = function(){
  this.resetButtons();
  this.resetSelectedItem(); 
};

VendingMachine.prototype.processRefund = function(){
  this.resetButtons();
  this.resetSelectedItem();
  this.returnCredit();
}

VendingMachine.prototype.processSaleRequest = function(){
  this.pendingPurchase = this.itemSearch();
  this.beginSaleProcess();
};

VendingMachine.prototype.beginSaleProcess = function(){
  if(!this.pendingPurchase) return;
  var creditDiff = calcDiff(this.pendingPurchase, this.credits);
  if (creditDiff === 0) { return this.processPaidInFull() };
  if(creditDiff > 0) { return this.processOverPay(creditDiff) };
  this.processUnderPay();
}

VendingMachine.prototype.processPaidInFull = function(){
  this.vendItem();
  this.resetSelectedItem();
};

VendingMachine.prototype.processOverPay = function(creditDiff){
  this.vendItem();
  this.returnCredit(creditDiff);
  this.resetSelectedItem();
};

VendingMachine.prototype.processUnderPay = function(){
  this.resetSelectedItem();
};

VendingMachine.prototype.returnCredit = function(credit){
  var creditToBeReturned = credit || this.credits;
  this.credits -= creditToBeReturned;
  return creditToBeReturned;
};

VendingMachine.prototype.resetButtons = function(){
  this.buttonQueue = '';
}

VendingMachine.prototype.resetSelectedItem = function(){
  this.pendingPurchase = null;
}

VendingMachine.prototype.itemSearch = function(){
  var item = this.inventory[this.buttonQueue];
  var itemPayload = {};
  itemPayload[this.buttonQueue] = item;
  return item ? itemPayload : null;
};

VendingMachine.prototype.vendItem = function(){
  // return item
  // adjust item count or clear item slot
};



function calcDiff(purchase, credits){
  var item = purchase[Object.keys(purchase)[0]];
  return credits - item.cost;
}

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