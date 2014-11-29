// Constants
var CONNECTION_STRING = 'http://localhost:8080/models/mc'

// Game variables
var isXTurn;
var currentGrid;
var xBot;
var oBot;
var board;
var seq;
var model;

$(function() {
  $('body').append('<div id="game"></div>');
  $('#game').append('<div class="grid" id="grid"></div>');
  for (var j = 0; j < 9; j++) {
    $('#grid').append('<div class="button" id="button' + j + '"></div>');
    if (j % 3 === 2) {
      $('#grid').append('<br />');
    }
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
      var vals = [];
      var win = me === 'X' ? 1 : -1;
      for (var i=0; i<seq.length; i++) {
        vals.push(win);
        win = -win;
      }
      console.log(vals);
      parent.addClass(me + '-won');
      $.ajax({
        type: 'POST',
        url: CONNECTION_STRING,
        dataType: 'json',
        data: { keys: seq, values: vals },
        success : function(data) {
          console.log(data);
        },
        failure : function(err) {
          console.log('failed');
        }
      });
      window.alert(me + ' won!');
      resetGame();
      return;
    }
    else if (parent.children('.X-selected, .O-selected').length === 9) {
      var vals = [];
      for (var i=0; i<seq.length; i++) {
        vals.push(0);
      }
      console.log(vals);
      parent.addClass('no-win');
      $.ajax({
        type: 'POST',
        url: CONNECTION_STRING,
        dataType: 'json',
        data: { keys: seq, values: vals },
        success : function(data) {
          console.log(data);
        },
        failure : function(err) {
          console.log('failed');
        }
      });
      window.alert('Draw');
      resetGame();
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
  $('#button' + Xmove(board, model)).trigger("click");
  return;
}

function Oturn(board) {
  $('#button' + Omove(board, model)).trigger("click");
  return;
}

function resetGame() {
  isXTurn = true;
  currentGrid = -1;
  xBot = true;
  oBot = false;
  board = 0;
  seq = [];
  $.ajax({
    type: 'GET',
    async: false,
    url: CONNECTION_STRING,
    datatype: 'json',
    success : function(data) {
      model = data;
    },
    failure : function(err) {
      console.log('failed');
    }
  });
  $('div').removeClass('X-won O-won no-win X-selected O-selected');
  $('.button').html('');
  if (xBot) {
    Xturn(board);
  }
}