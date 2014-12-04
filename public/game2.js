// Game variables
var isXTurn;
var currentGrid;
var xBot;
var oBot;
var board;
var predict;
var weight;
var newWeight;
var alpha = .1;

$(function() {
  $('body').append('<div id="game"></div>');
  $('#game').append('<div class="grid" id="grid"></div>');
  for (var j = 0; j < 9; j++) {
    $('#grid').append('<div class="button" id="button' + j + '"></div>');
    if (j % 3 === 2) {
      $('#grid').append('<br />');
    }
  }

  var handleWin = function(win, winner, parent) {
    parent.addClass(winner + '-won');
    console.log(winner);
    sendTD0(newWeight);
    if (!oBot || !xBot) {
      window.alert(winner + ' won!');
    }
    resetGame();
  }
  $('.button').click(function() {
    var parent = $(this).parent();
    var me = isXTurn ? 'X' : 'O';
    var buttonNum = parseInt($(this).attr('id')[6]);

    if ($(this).is('.X-selected, .O-selected') || parent.is('.X-won, .O-won')) {
      return;
    }
    $(this).addClass(me + '-selected').html(me);
  	if(isXTurn){
  	  board += Math.pow(3, buttonNum);
  	}
  	else {
  	  board += 2 * Math.pow(3, buttonNum);
  	}
    
    var info = valueAndGradientOfBoard(board, weight);

    if (checkForWin($(this), ('.' + me + '-selected'))) {
      var win = me === 'X' ? 1 : -1;
      updateWeight(newWeight, info.output + checkwin(board, 1), predict, info.gradient, alpha);
      handleWin(win, me, parent);
      return;
    }
    else if (parent.children('.X-selected, .O-selected').length === 9) {
      updateWeight(newWeight, info.output + checkwin(board, 1), predict, info.gradient, alpha);
      handleWin(0, 'No one', parent);
      return;
    }

    updateWeight(newWeight, info.output, predict, info.gradient, alpha);
    predict = info.output;

    isXTurn = !isXTurn;

    if (isXTurn && xBot) {
      Xturn(board);
    }
    if (!isXTurn && oBot) {
      Oturn(board);
    }
  });

  function checkForWin(elem, match) {
    var index = +(elem.attr('id').slice(-1));
    var prefix = '#button';
    // Check rows
    if (elem.nextUntil('br').add(elem.prevUntil('br')).filter(match).length === 2) {
      return true;
    }
    // Check columns
    if ($(prefix + (index % 3)).add($(prefix + (index % 3 + 3))).add($(prefix + (index % 3 + 6))).filter(match).length === 3) {
      return true;
    }
    // Check diagonals
    if ($(prefix + 0).add($(prefix + 4)).add($(prefix + 8)).filter(match).length === 3) {
      return true;
    }
    if ($(prefix + 2).add($(prefix + 4)).add($(prefix + 6)).filter(match).length === 3) {
      return true;
    }
    return false;
  }

  resetGame();
});

function Xturn(board) {
  $('#button' + TDXmove(board, weight, !oBot)).trigger("click");
  return;
}

function Oturn(board) {
  $('#button' + randMove(board)).trigger("click");
  return;
}

function resetGame() {
  isXTurn = true;
  currentGrid = -1;
  xBot = true;
  oBot = false;
  board = 0;
  getTD0(function(data) {
    weight = data;
    newWeight = weight.slice(0);
    predict = valueAndGradientOfBoard(board, weight).output;
    if (xBot) {
      Xturn(board);
    }
  });
  $('div').removeClass('X-won O-won no-win X-selected O-selected');
  $('.button').html('');
}