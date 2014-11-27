var express = require('express');
var path = require('path');
var router = express.Router();
var Value = require('../models/value');

router.get('/', function(request, response) {
  Value.findOne({name: 'tictactoe'}, function(err, doc) {
    out = {};
    for (var i = 0; i < doc.values.length; i++) {
      out[doc.values[i].key] = doc.values[i].value;
    }
    response.json(out);
  });
});

router.post('/', function(request, response) {
  var keys = request.body.keys;
  var values = request.body.values;
  var inputs = [];
  for (var i = 0; i < keys.length; i++) {
    inputs.push({
      key: keys[i],
      value: values[i]
    });
  }
  Value.findOne({name: 'tictactoe'}, function(err, doc) {
    var values = doc.values;
    var lookup = {};
    for (var i = 0; i < values.length; i++) {
      lookup[values[i].key] = values[i];
    }
    for (var i = 0; i < inputs.length; i++) {
      if (lookup[inputs[i].key]) {
        console.log('existing');
        console.log(lookup[inputs[i].key]);
        lookup[inputs[i].key].value = inputs[i].value;
      }
      else {
        lookup[inputs[i].key] = {
          key: inputs[i].key,
          value: inputs[i].value
        };
        console.log('nonexistent');
        console.log(lookup[inputs[i].key]);
        values.push(lookup[inputs[i].key]);
      }
    }
    doc.save(function(err, doc) {
      response.json({success: true});
    });
  });
});

router.put('/', function(request, response) {
  Value.remove({name: 'tictactoe'}, function(err, doc) {});
  var newModel = new Value({
    name: 'tictactoe',
    values: []
  });
  newModel.save(function(err, doc) {
    response.json({success: true});
  });
});

router.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/ttt.html'));
});

module.exports = router;