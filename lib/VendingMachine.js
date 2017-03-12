function VendingMachine(){
  this.height = 8;
  this.width = 6;
  this.depth = 8;
  this.buttonQueue = '';
  this.inventory = {};
  this.credits = 0;
  this.acceptedVals = [.25, 1, 5];
  this.bank = 0;
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
  this.pendingPurchase = this.pendingPurchase || itemSearch(this.inventory, this.buttonQueue);
  this.beginSaleProcess();
};

VendingMachine.prototype.beginSaleProcess = function(){
  if(!this.pendingPurchase) return;
  var creditDiff = calcDiff(this.pendingPurchase, this.credits);
  if (creditDiff >= 0){ this.vendItem(); }
  this.resetSelectedItem();
}

VendingMachine.prototype.vendItem = function(){
  var key = Object.keys(this.pendingPurchase)[0];
  var item = this.pendingPurchase[key];
  this.bank += item.cost;
  this.credits -= item.cost;
  this.decrementCount(key, item);
  this.returnCredit();
  return item
};

VendingMachine.prototype.decrementCount = function(key, item){
  item.quantity -= 1;
  item.quantity ? this.inventory[key] = item : delete this.inventory[key];
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

function itemSearch(inventory, buttons){
  var item = inventory[buttons];
  var itemPayload = {};
  itemPayload[buttons] = item;
  return item ? itemPayload : null;
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