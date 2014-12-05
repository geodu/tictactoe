function sigmoid(x) {
  if (x < -10) {
    return 0;
  }
  else if (x > 10) {
    return 1;
  }
  else {
    return 1.0 / (1 + Math.exp(-x));
  }
}

function boardToRows(board) {
  var newBoard = [];
  boardArray = boardToArray(board);
  for(var i =0; i<3; i++) {
    newBoard.push([boardArray[i], boardArray[i+3], boardArray[i+6]]);
    newBoard.push([boardArray[3*i], boardArray[3*i+1], boardArray[3*i+2]]);
  }
  
  newBoard.push([boardArray[0], boardArray[4], boardArray[8]]);
  newBoard.push([boardArray[2], boardArray[4], boardArray[6]]);
  return newBoard;
}

function boardToNormalForm(board){
  var boardArray = boardToArray(board);
  var minBoard = board;
  var newBoard = board;
  var rotationNum = 0
  var rotation = []
  rotation[0] = [0,1,2,3,4,5,6,7,8];
  rotation[1] = [0,3,6,1,4,7,2,5,8];
  rotation[2] = [2,5,8,1,4,7,0,3,6];
  rotation[3] = [2,1,0,5,4,3,8,7,6];
  rotation[4] = [6,7,8,3,4,5,0,1,2];
  rotation[5] = [6,3,0,7,4,1,8,5,2];
  rotation[6] = [8,7,6,5,4,3,2,1,0];
  rotation[7] = [8,5,2,7,4,1,6,3,0];
  
  for(var i=0; i<8; i++){
    newBoard = arrayToBoard(boardArray, rotation[i])
    if (newBoard < minBoard){
      minBoard = newBoard;
	  rotationNum = i;
    }
  }
  return minBoard;
}

function boardToArray(board) {
  var boardArray = [];
  for(var i=0; i<9; i++){
    boardArray[i] = (board % 3);
    board = (board-board%3) / 3;
  }
  return boardArray;
}

function arrayToBoard(boardArray, rotationNum){
  var board = 0;
  for(var i=0; i<9; i++) {
    board += boardArray[i]*Math.pow(3,rotationNum[i]);
  }
  return board;
}

function Xmove(board, model, opt) {
  return smartMove(board, function(b) {
    return model[b] + 1.1;
  }, 1, opt, false);
}

function Omove(board, model, opt) {
  //return smartMove(board, model, 2, opt);
  return smartMove(board, function(b) {
    return model[b] + 1.1;
  }, 2, opt, false);
}

function smartMove(board, model, turn, opt, reward)
{
  var boardArray = boardToArray(board);
  var move = [];
  move[-1] = -100000000;
  var argmax = -1;
  var sum = 0;
  var cutoff = 0;
  for (var i = 0; i < 9; i++) {
    if (!boardArray[i]) {
      var childBoard = board+turn*Math.pow(3,i);//boardToNormalForm(board+turn*Math.pow(3,i));
      var modelValue = model(childBoard);
      if (modelValue !== undefined) {
        move[i] = modelValue;
        if (reward) {
          move[i] += checkwin(childBoard, turn);
        }
      }
      else { // model does not contain childBoard
        move[i] = 1.1;
      }
  	  if (move[i] > move[argmax]) {
  		  argmax = i;
  	  }
      sum += move[i];
    }
  }
  if (opt === true) {
    return argmax;
  }
  else{
    var ran = Math.random();
  	for (var i = 0; i < 9; i++) {
  	  if(!boardArray[i]) {
  	    cutoff += (move[i])/sum;
    		if(cutoff > ran) {
    		  return i;
    		}
  	  }
  	}
  }
}

function randMove(board) {
  var boardArray = boardToArray(board);
  var sum = 0;
  var cutoff = 0;
  for (var i = 0; i < 9; i++) {
    if(!boardArray[i]) {
      sum += 1;
    }
  }
  
  var ran = Math.random();
  for (var i = 0; i < 9; i++) {
    if(!boardArray[i]) {
      cutoff += 1.0/sum;
      if(cutoff > ran) {
        return i;
      }
    }
  }
}

function valueAndGradientOfBoard(board, weight) {
  var input = [];
  var boardArray = boardToArray(board);
  var changeEntries = [0.0, 1.0, 0.0];
  var changeEntries2 = [0.0, 0.0, 1.0];
  input.push(changeEntries[boardArray[0]] + changeEntries[boardArray[2]] + changeEntries[boardArray[6]] + changeEntries[boardArray[8]]);
  input.push(changeEntries[boardArray[1]] + changeEntries[boardArray[3]] + changeEntries[boardArray[5]] + changeEntries[boardArray[7]]);
  input.push(changeEntries2[boardArray[0]] + changeEntries2[boardArray[2]] + changeEntries2[boardArray[6]] + changeEntries2[boardArray[8]]);
  input.push(changeEntries2[boardArray[1]] + changeEntries2[boardArray[3]] + changeEntries2[boardArray[5]] + changeEntries2[boardArray[7]]);
  input.push(changeEntries[boardArray[4]]);
  input.push(changeEntries2[boardArray[4]]);
  var boardRows = boardToRows(board);
  var countX = 0;
  var countY = 0;
  for (var i = 0; i < boardRows.length; i++) {
    var line = boardRows[i];
    var count1 = 0;
    var count2 = 0;
    for (var j = 0; j < line.length; j++) {
      if (line[j] === 1) {
        count1++;
      }
      else if (line[j] === 2) {
        count2++;
      }
    }
    countX += count1 === 2 && count2 === 0 ? 1 : 0;
    countY += count2 === 2 && count1 === 0 ? 1 : 0;
  }
  input.push(countX);
  input.push(countY);
  //console.log(weight);
  var output = 0;
  for (var i = 0; i <weight.length; i++) {
    output += input[i]*weight[i];
  }
  //console.log(output);
  var gradient = [];
  for(var i=0; i<8; i++) {
    gradient[i] = Math.pow(1+Math.exp(-output),-2)*Math.exp(-output)*input[i];
  }
  
  return {
    output: sigmoid(output),
    gradient: gradient
  };
}

/*
function valueAndGradientOfBoard(board, weight) {
  var input = [];
  var boardArray = boardToArray(board);
  var changeEntries = [0.0, 1.0, 0.0];
  var changeEntries2 = [0.0, 0.0, 1.0];
  for(var i=0; i<9; i++) {
    input[i] = changeEntries[boardArray[i]];
    input[i + 9] = changeEntries2[boardArray[i]];
  }
  var hidden = [];
  var hiddensum = [];
  for(var i=0; i<8; i++) {
    hiddensum[i] = 0;
    for(var j=0; j<18; j++) {
      hiddensum[i] += weight[18*i+j]*input[j];
    }
    hidden[i] = sigmoid(hiddensum[i]);
  }
  
  var output = 0;
  var outputsum = 0;
  for(var i=0; i<8; i++) {
    outputsum += weight[144+i]*hidden[i];
  }
  output = sigmoid(outputsum);
  
  var gradient = [];
  for(var i=0; i<8; i++) {
    gradient[144+i] = Math.pow(1+Math.exp(-output),-2)*Math.exp(-outputsum)*hidden[i];
  }
  
  for(var i=0; i<8; i++) {
    for(var j=0; j<18; j++) {
      gradient[18*i+j] = Math.pow(1+Math.exp(-hidden[i]),-2)*Math.exp(-hiddensum[i])*input[j]*gradient[144+i];
    }
  }
  
  return {
    output: output,
    gradient: gradient
  };
}
*/

function updateWeight(newWeight, predictNew, predict, gradient, alpha){
  //console.log(gradient);
  for(var i=0; i<newWeight.length; i++) {
    //console.log(gradient[i]);
    newWeight[i] = newWeight[i] + alpha*(predictNew - predict)*gradient[i];
  }
}


function TDmove(board, weight, turn, opt) {
  var model;
  model = function (b) {
      return valueAndGradientOfBoard(b,weight).output;
    }
  /*
  if (turn === 1) {
    model = function (b) {
      return valueAndGradientOfBoard(b,weight).output;
    }
  }
  else {
    model = function (b) {
      return 1 - valueAndGradientOfBoard(b,weight).output;
    }
  }*/
  
  var returned = smartMove(board, model, turn, opt, true);
  //console.log(returned);
  return returned;
}

function TDXmove(board, weight, opt) {
  return TDmove(board, weight, 1, opt);
}

function TDOmove(board, weight, opt) {
  return TDmove(board, weight, 2, opt);
}

function checkWinHelper(board, turn) {
  boardArray = boardToArray(board);
  for(var i =0; i<3; i++) {
    if(boardArray[i] == turn && boardArray[i+3] == turn && boardArray[i+6] == turn) {
      return true;
    }
    if(boardArray[3*i] == turn && boardArray[3*i+1] == turn && boardArray[3*i+2] == turn) {
      return true;
    }
  }
  
  if(boardArray[0] == turn && boardArray[4] == turn && boardArray[8] == turn) {
    return true;
  }
  if(boardArray[2] == turn && boardArray[4] == turn && boardArray[6] == turn) {
    return true;
  }
  return false;
}

function checkwin(board, turn) {
  // Turn wins
  if (checkWinHelper(board, turn)) {
    return 1;
  }
  // Turn loses
  if (checkWinHelper(board, 3-turn)) {
    return 0;
  }
  // Tie
  return 0.5;
}