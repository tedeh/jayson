/*
 * Helper for testing object instantiation/serialization
 */
var Counter = module.exports = function(value) {
  if(typeof(value) !== 'number' || !isFinite(value)) value = 0;
  this.count = value;
};

/*
 * Increment internal counter
 */
Counter.prototype.incrementBy = function(value) {
  this.count += value;
};

