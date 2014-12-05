// Game variables
var isXTurn;
var currentGrid;
var xBot = false;
var oBot = false;
var board;
var predictX;
var predictO;
var gradientX;
var gradientO;
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
    console.log(board);
    sendTD0('X', newWeightX);
    sendTD0('O', newWeightO);
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
    
    var infoX = valueAndGradientOfBoard(board, weightX);
    var infoO = valueAndGradientOfBoard(board, weightO);

    if (checkForWin($(this), ('.' + me + '-selected'))) {
      updateWeight(newWeightX, checkwin(board, 1), predictX, gradientX, alpha);
      updateWeight(newWeightO, checkwin(board, 2), predictO, gradientO, alpha);
      handleWin(me);
      return;
    }
    else if ($('.X-selected, .O-selected').length === 9) {
      updateWeight(newWeightX, checkwin(board, 1), predictX, gradientX, alpha);
      updateWeight(newWeightO, checkwin(board, 2), predictO, gradientO, alpha);
      handleWin('No one');
      return;
    }
    if (me === 'X') {
      updateWeight(newWeightX, infoX.output, predictX, gradientX, alpha);
    }
    else {
      updateWeight(newWeightO, infoO.output, predictO, gradientO, alpha);
    }
    predictX = infoX.output;
    gradientX = infoX.gradient;
    predictO = infoO.output;
    gradientO = infoO.gradient;
    
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
  $('#button' + TDOmove(board, weightO, true)).trigger("click");
  return;
}

function resetGame() {
  isXTurn = true;
  currentGrid = -1;
  board = 0;
  getTD0('X', function(data) {
    weightX = data;
    newWeightX = weightX.slice(0);
    var valGrad = valueAndGradientOfBoard(board, weightX);
    predictX = valGrad.output;
    gradientX = valGrad.gradient;
    if (xBot) {
      Xturn(board);
    }
  });
  getTD0('O', function(data) {
    weightO = data;
    newWeightO = weightO.slice(0);
    var valGrad = valueAndGradientOfBoard(board, weightO);
    predictO = valGrad.output;
    gradientO = valGrad.gradient;
  });
  $('div').removeClass('X-selected O-selected');
  $('.button').html('');
}