var Counter = exports.Counter = function(value) {
  this.count = value || 0;
};

Counter.prototype.increment = function() {
  this.count += 1;
};

exports.replacer = function(key, value) {
  if(value instanceof Counter) {
    return {$class: 'counter', $props: {count: value.count}};
  }
  return value;
};

exports.reviver = function(key, value) {
  if(value && value.$class === 'counter') {
    var obj = new Counter;
    for(var prop in value.$props) obj[prop] = value.$props[prop];
    return obj;
  }
  return value;
};
