// Game variables
var isXTurn;
var currentGrid;
var xBot = false;
var oBot = false;
var board;
var predict;
var weightX;
var weightO;
var newWeightX;
var newWeightO;
var alpha = .1;

var games = 1.0;
var gamesWon = 1.0;

$(function() {
  for (var j = 0; j < 9; j++) {
    $('#grid').append('<div class="button" id="button' + j + '"></div>');
    if (j % 3 === 2) {
      $('#grid').append('<br />');
    }
  }
  var ctx = $("#myChart").get(0).getContext("2d");
  var data = {
    labels: [0, ''],
    datasets: [
      {
        label: "Win rate",
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: [0, 1]
      }
    ]
  };
  var myLineChart = new Chart(ctx).Line(data, {
    animation: false,
    showXLabels: 10
  });

  var handleWin = function(winner) {
    games++;
    if (winner === 'X') {
      gamesWon++;
    }
    var label = games % 10 === 0 ? games : '';
    myLineChart.addData([gamesWon / games], label)
    console.log(winner);
    sendTD0('X', newWeightX);
    if (!oBot || !xBot) {
      window.alert(winner + ' won!');
    }
    resetGame();
  }
  $('.button').click(function() {
    var me = isXTurn ? 'X' : 'O';
    var buttonNum = parseInt($(this).attr('id')[6]);

    if ($(this).is('.X-selected, .O-selected')) {
      return;
    }
    $(this).addClass(me + '-selected').html(me);
  	if(isXTurn){
  	  board += Math.pow(3, buttonNum);
  	}
  	else {
  	  board += 2 * Math.pow(3, buttonNum);
  	}
    
    var info = valueAndGradientOfBoard(board, weightX);

    if (checkForWin($(this), ('.' + me + '-selected'))) {
      updateWeight(newWeightX, checkwin(board, 1), predict, info.gradient, alpha);
      handleWin(me);
      return;
    }
    else if ($('.X-selected, .O-selected').length === 9) {
      updateWeight(newWeightX, checkwin(board, 1), predict, info.gradient, alpha);
      handleWin('No one');
      return;
    }

    updateWeight(newWeightX, info.output, predict, info.gradient, alpha);
    predict = info.output;

    isXTurn = !isXTurn;

    if (isXTurn && xBot) {
      Xturn(board);
    }
    if (!isXTurn && oBot) {
      Oturn(board);
    }
  });
  $('#xBot').click(function() {
    $(this).toggleClass("down");
    xBot = !xBot;
    resetGame();
  });
  $('#oBot').click(function() {
    $(this).toggleClass("down");
    oBot = !oBot;
    resetGame();
  });
  $('#reset').click(function() {
    resetGame();
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
  $('#button' + TDXmove(board, weightX, true)).trigger("click");
  return;
}

function Oturn(board) {
  $('#button' + randMove(board, weightX, true)).trigger("click");
  return;
}

function resetGame() {
  isXTurn = true;
  currentGrid = -1;
  board = 0;
  getTD0('X', function(data) {
    weightX = data;
    newWeightX = weightX.slice(0);
    predict = valueAndGradientOfBoard(board, weightX).output;
    if (xBot) {
      Xturn(board);
    }
  });
  $('div').removeClass('X-selected O-selected');
  $('.button').html('');
}