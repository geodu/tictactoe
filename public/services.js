var MODELS_PATH = 'http://localhost:8080/models/';

function getModel(modelString, callback) {
  $.ajax({
    type: 'GET',
    url: MODELS_PATH + modelString,
    datatype: 'json',
    success : function(data) {
      callback(data);
    },
    failure : function(err) {
      //console.log('failed');
    }
  });
}

function sendMC(seq, vals) {
  $.ajax({
    type: 'POST',
    url: MODELS_PATH + 'mc',
    dataType: 'json',
    data: { keys: seq, values: vals },
    success : function(data) {
      //console.log(data);
    },
    failure : function(err) {
      //console.log('failed');
    }
  });
}

function getMC(callback) {
  return getModel('mc', callback);
}

function sendTD0(name, weights) {
  $.ajax({
    type: 'POST',
    url: MODELS_PATH + 'td0',
    dataType: 'json',
    data: {
      name: name,
      weights: weights
    },
    success : function(data) {
      //console.log(data);
    },
    failure : function(err) {
      //console.log('failed');
    }
  });
}

function getTD0(name, callback) {
  return getModel('td0/' + name, callback);
}

function initializeWeights(num) {
  var weights = [];
  for (var i = 0; i < num; i++) {
    weights.push((Math.random() - 0.5) / 10);
  }
  sendTD0('X', weights);
  weights = [];
  for (var i = 0; i < num; i++) {
    weights.push((Math.random() - 0.5) / 10);
  }
  sendTD0('O', weights);
}