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

var games = 0;
var gameArray = [];
var gamesWon = 0.0;
var gamesWonAndTied = 0.0;
var totalGamesWon = 0.0;
var totalGamesWonAndTied = 0.0;

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
  var myLineChart;

  var handleWin = function(winner) {
    games++;
    gameArray.push(winner);
    if (winner === 'X') {
      gamesWon++;
      gamesWonAndTied++;
      totalGamesWon++;
      totalGamesWonAndTied++;
    }
    else if (winner !== 'O') {
      gamesWonAndTied++;
      totalGamesWonAndTied++;
    }
    if (gameArray.length === 1) {
      var data = {
        labels: [0, ''],
        datasets: [
          {
            label: "Win rate",
            fillColor: "rgba(220,120,20,0.5)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,120,20,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [0, gamesWon]
          },
          {
            label: "Win and tie rate",
            fillColor: "rgba(20,120,220,0.5)",
            strokeColor: "rgba(20,120,220,1)",
            pointColor: "rgba(20,120,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [0, gamesWonAndTied]
          },
        ]
      };
      myLineChart = new Chart(ctx).Line(data, {
        animation: false,
        bezierCurve: false,
        pointDot: false,
        showTooltips: false
      });
    }
    else {
      if (games === 1000) {
        console.log(totalGamesWon);
        console.log(totalGamesWonAndTied);
        oBot = false;
      }
      if (gameArray.length > 100) {
        var removed = gameArray.splice(0, 1)[0];
        if (removed === 'X') {
          gamesWon--;
          gamesWonAndTied--;
        }
        else if (removed !== 'O') {
          gamesWonAndTied--;
        }
      }
      var label = games % 50 === 0 ? games : '';
      myLineChart.addData([gamesWon / Math.min(games, 100), gamesWonAndTied / Math.min(games, 100)], label)
    }
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
    if ($(this).is('.X-selected, .O-selected')) {
      return;
    }

    var me = isXTurn ? 'X' : 'O';
    var buttonNum = parseInt($(this).attr('id')[6]);
    if (!xBot || !oBot) {
      $(this).addClass(me + '-selected').html(me);
    }

  	if (isXTurn) {
  	  board += Math.pow(3, buttonNum);
  	}
  	else {
  	  board += 2 * Math.pow(3, buttonNum);
  	}

    var infoX = valueAndGradientOfBoard(board, weightX);
    var infoO = valueAndGradientOfBoard(board, weightO);
    var winVal = checkwin(board, isXTurn ? 1 : 2);

    if (winVal === 1) {
      updateWeight(newWeightX, checkwin(board, 1), predictX, gradientX, alpha);
      updateWeight(newWeightO, checkwin(board, 2), predictO, gradientO, alpha);
      handleWin(me);
      return;
    }
    else if (winVal === 0.5) {
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

  resetGame();
});

function Xturn(board) {
  $('#button' + TDXmove(board, weightX, false)).trigger("click");
  return;
}

function Oturn(board) {
  $('#button' + TDOmove(board, weightO, false)).trigger("click");
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