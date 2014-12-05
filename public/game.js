// Game variables
var isXTurn;
var currentGrid;
var xBot = false;
var oBot = false;
var board;
var seq;
var model;

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
  var myLineChart;

  var handleWin = function(win, winner, seq) {
    games++;
    gameArray.push(win);
    if (win === 1) {
      gamesWon++;
      gamesWonAndTied++;
      totalGamesWon++;
      totalGamesWonAndTied++;
    }
    else if (win === 0) {
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
        if (removed === 1) {
          gamesWon--;
          gamesWonAndTied--;
        }
        else if (removed === 0) {
          gamesWonAndTied--;
        }
      }
      var label = games % 50 === 0 ? games : '';
      myLineChart.addData([gamesWon / Math.min(games, 100), gamesWonAndTied / Math.min(games, 100)], label)
    }
    var vals = [];
    for (var i=0; i<seq.length; i++) {
      vals.push(win);
      win = -win;
    }
    //sendMC(seq, vals);
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

  	if(isXTurn){
  	  board += Math.pow(3, buttonNum);
  	}
  	else {
  	  board += 2 * Math.pow(3, buttonNum);
  	}
  	seq.push(boardToNormalForm(board));

    var winVal = checkwin(board, isXTurn ? 1 : 2);
    if (winVal === 1) {
      var win = me === 'X' ? 1 : -1;
      handleWin(win, me, seq);
      return;
    }
    else if (winVal === 0.5) {
      handleWin(0, 'No one', seq);
      return;
    }

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
  // do not use opt
  $('#button' + randMove(board, model, true)).trigger("click");
  return;
}

function Oturn(board) {
  // use opt
  $('#button' + Omove(board, model, true)).trigger("click");
  return;
}

function resetGame() {
  isXTurn = true;
  currentGrid = -1;
  board = 0;
  seq = [];
  getMC(function(data) {
    model = data;
    if (xBot) {
      Xturn(board);
    }
  });
  $('div').removeClass('X-selected O-selected');
  $('.button').html('');
}