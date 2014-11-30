var express = require('express');
var path = require('path');
var router = express.Router();
var Value = require('../models/value').Value;

router.get('/mc', function(request, response) {
  Value.findOne({name: 'monte carlo'}, function(err, doc) {
    out = {};
    for (var i = 0; i < doc.values.length; i++) {
      out[doc.values[i].key] = doc.values[i].value;
    }
    response.json(out);
  });
});

router.post('/mc', function(request, response) {
  var keys = request.body.keys;
  var values = request.body.values;
  var inputs = [];
  for (var i = 0; i < keys.length; i++) {
    inputs.push({
      key: keys[i],
      value: values[i]
    });
  }
  Value.findOne({name: 'monte carlo'}, function(err, doc) {
    var values = doc.values;
    var lookup = {};
    for (var i = 0; i < values.length; i++) {
      lookup[values[i].key] = values[i];
    }
    for (var i = 0; i < inputs.length; i++) {
      if (lookup[inputs[i].key]) {
        console.log('existing');
        element = lookup[inputs[i].key];
        element.value = (element.value * element.occurrences + parseInt(inputs[i].value)) / (element.occurrences + 1.0);
        element.occurrences += 1;
      }
      else {
        lookup[inputs[i].key] = {
          key: inputs[i].key,
          value: inputs[i].value,
          occurrences: 1
        };
        console.log('nonexistent');
        values.push(lookup[inputs[i].key]);
      }
    }
    doc.save(function(err, doc) {
      response.json({success: true});
    });
  });
});

router.put('/mc', function(request, response) {
  Value.remove({name: 'monte carlo'}, function(err, doc) {});
  var newModel = new Value({
    name: 'monte carlo',
    values: []
  });
  newModel.save(function(err, doc) {
    response.json({success: true});
  });
});

module.exports = router;