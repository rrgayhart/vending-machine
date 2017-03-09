function VendingMachine(){
  this.buttonQueue = '';
}

VendingMachine.prototype.selectButton = function(key){
  this.buttonQueue += key;
};

module.exports = VendingMachine;