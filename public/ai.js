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
  move[-1] = -10;
  var argmax = -1;
  var sum = 0;
  var cutoff = 0;
  for (var i = 0; i < 9; i++) {
    if (!boardArray[i]) {
      var childBoard = boardToNormalForm(board+turn*Math.pow(3,i));
      if (model(childBoard)) {
        move[i] = model(childBoard);
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
  if(opt === true){
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
    gradient[144+i] = Math.pow(output,2)*Math.exp(-outputsum)*hidden[i];
  }
  
  for(var i=0; i<8; i++) {
    for(var j=0; j<18; j++) {
      gradient[18*i+j] = Math.pow(hidden[i],2)*Math.exp(-hiddensum[i])*input[j]*gradient[144+i];
    }
  }
  
  return {
    output: output,
    gradient: gradient
  };
  
}

//need predict to be 1 for a winning board
function updateWeight(newWeight, predictNew, predict, gradient, alpha){

  //console.log(alpha*(predictNew - predict));
  for(var i=0; i<152; i++) {
    //console.log(gradient[i]);
    newWeight[i] = newWeight[i] + alpha*(predictNew - predict)*gradient[i];
  }
}


function TDmove(board, weight, turn, opt) {
  function model(b) {
    return valueAndGradientOfBoard(b,weight).output;
  }
  return smartMove(board, model, turn, opt);
}

function TDXmove(board, weight, opt) {
  return TDmove(board, weight, 1, opt, true);
}

function TDOmove(board, weight, opt) {
  return TDmove(board, weight, 2, opt, true);
}

function checkwin(board, turn) {
  boardArray = boardToArray(board);
  for(int i =0; i<3; i++) {
    if(boardArray[i] == turn && boardArray[i+3] == turn && boardArray[i+6] == turn) {
      return 1;
    }
    if(boardArray[3*i] == turn && boardArray[3*i+1] == turn && boardArray[3*i+2] == turn) {
      return 1;
    }
  }
  
  if(boardArray[0] == turn && boardArray[4] == turn && boardArray[8] == turn) {
    return 1;
  }
  if(boardArray[2] == turn && boardArray[4] == turn && boardArray[7] == turn) {
    return 1;
  }
  return 0;
}