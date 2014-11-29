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
  return {
    board: minBoard,
    rotation: rotation[rotationNum]
  }
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

function Xmove(board) {
  var boardArray = boardToArray(board);
  for (var i = 0; i < 9; i++) {
    if (!boardArray[i]) {
      return i;
    }
  }
}

function Omove(board) {
  var boardArray = boardToArray(board).board;
  for (var i = 0; i < 9; i++) {
    if (!boardArray[i]) {
      return i;
    }
  }
}