// Game variables
var isXTurn;
var currentGrid;
var xBot = true;
var oBot = true;
var board;
var seq;
var model;

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

  var handleWin = function(win, winner, parent, seq) {
    games++;
    if (win) {
      gamesWon++;
    }
    if (games === 100) {
      oBot = false;
    }
    var label = games % 10 === 0 ? games : '';
    myLineChart.addData([gamesWon / games], label)
    var vals = [];
    for (var i=0; i<seq.length; i++) {
      vals.push(win);
      win = -win;
    }
    parent.addClass(winner + '-won');
    sendMC(seq, vals);
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
  	seq.push(boardToNormalForm(board));
    if (checkForWin($(this), ('.' + me + '-selected'))) {
      var win = me === 'X' ? 1 : -1;
      handleWin(win, me, parent, seq);
      return;
    }
    else if (parent.children('.X-selected, .O-selected').length === 9) {
      handleWin(0, 'No one', parent, seq);
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
  // do not use opt
  $('#button' + Xmove(board, model, true)).trigger("click");
  return;
}

function Oturn(board) {
  // use opt
  $('#button' + randMove(board, model, true)).trigger("click");
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
  $('div').removeClass('X-won O-won no-win X-selected O-selected');
  $('.button').html('');
}