var mongoose = require("mongoose");

var valueSchema = new mongoose.Schema({
  name: String,
  values: [{
    key: Number,
    value: Number,
    occurrences: Number
  }]
});

var weightSchema = new mongoose.Schema({
  weights: [Number]
});

var val = mongoose.model('Value', valueSchema);
var wei = mongoose.model('Weight', weightSchema);

module.exports = {
  Value: val,
  Weight: wei
}