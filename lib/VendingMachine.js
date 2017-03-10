function VendingMachine(params){
  this.height = 8;
  this.width = 6;
  this.depth = 8;
  this.buttonQueue = '';
  this.inventory = {};
}

VendingMachine.prototype.loadMachine = function(input){
  var load = loadItem.bind(this);
  var inputIsString = typeof input === 'string';
  inputIsString ? load(input) : input.forEach(load);
};

VendingMachine.prototype.selectButton = function(key){
  this.buttonQueue += key;
  if (this.buttonQueue.length < 2) return;
  this.itemSearch();
};

VendingMachine.prototype.itemSearch = function(){

};

function loadItem(payload){
  for(var a = 97; a < (97 + this.height); a++){
    var key = String.fromCharCode(a);
    for(var i = 1; i <= this.width; i++){
      if(!this.inventory[key + i]){
        return this.inventory[key + i] = [payload, this.depth];
      }
    }
  }
}

module.exports = VendingMachine;