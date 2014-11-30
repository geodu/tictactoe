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
  return smartMove(board, model, 1, opt);
}

function Omove(board, model, opt) {
  //return smartMove(board, model, 2, opt);
  return smartMove(board, model, 2, opt);
}

function smartMove(board, model, turn, opt)
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
      if (model[childBoard]) {
        move[i] = model[childBoard];
      }
      else { // model does not contain childBoard
        move[i] = 0;
      }
  	  if (move[i] > move[argmax]) {
  		  argmax = i;
  	  }
      sum += move[i]+2;
    }
  }
  if(opt === true){
    return argmax;
  }
  else{
    var ran = Math.random();
  	for (var i = 0; i < 9; i++) {
  	  if(!boardArray[i]) {
  	    cutoff += (move[i]+2)/sum;
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

function valueOfBoard(board, weight) {
  var input = boardToArray(board);
  var changeEntries = [0.5, 1, 0];
  for(var i=0; i<9; i++){
    input[i] = changeEntries[inputs[i]];
  }
  var hidden = []
  for(var i=0; i<4; i++) {
    hidden[i] = 0;
    for(var j=0; j<9; j++) {
      hidden[i] += weight[9*i+j]*input[j];
    }
    hidden[i] = 1/(1+Math.pow(Math.E, -hidden[i]));
  }
  
  var output = 0;
  for(var i=0; i<4; i++) {
    output += weight[36+i]*hidden[i];
  }
  output = 1/(1+Math.pow(Math.E, -output));
  return output
}

function gradientOfBoard(board, weight){

}

//need predict to be 1 for a winning board
function updateWeight(newWeight, predictNew, predict, gradient, alpha){
  for(var i=0; i<40; i++){
    newWeight[i] = newWeight[i] + alpha*(predictNew - predict)*gradient[i];
  }
  return newWeight;
}

