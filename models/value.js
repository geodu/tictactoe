var mongoose = require("mongoose");

var valueSchema = new mongoose.Schema({
  name: String,
  values: [{
    key: Number,
    value: Number,
    occurrences: Number
  }]
});

var val = mongoose.model('Value', valueSchema);

module.exports = val;