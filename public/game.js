var isXTurn = true;
var xBot = true;
var oBot = false;
var board = 0;
$(function() {
  $('body').append('<div id="game"></div>');
  $('#game').append('<div class="grid" id="grid"></div>');
  for (var j = 0; j < 9; j++) {
    $('#grid').append('<div class="button" id="button' + j + '"></div>');
    if (j % 3 == 2) {
      $('#grid').append('<br />');
    }
  }

  $('.button').click(function() {
    var parent = $(this).parent();
    var me = isXTurn ? 'X' : 'O';

    if ($(this).is('.X-selected, .O-selected') || parent.is('.X-won, .O-won')) {
      return;
    }
    $(this).addClass(me + '-selected').html(me);
    if (checkForWin($(this), ('.' + me + '-selected'))) {
      parent.addClass(me + '-won');
      window.alert(me + ' won!');
      resetGame();
      return;
    }
    else if (parent.children('.X-selected, .O-selected').length == 9) {
      parent.addClass('no-win');
      window.alert('Draw');
      resetGame();
      return;
    }

    isXTurn = !isXTurn;

    if(isXTurn && xBot){
      Xturn(board);
    }
    if(!isXTurn && oBot){
      Oturn(board);
    }
  });

  if (xBot) {
    Xturn(board);
  }

  function checkForWin(elem, match) {
    var index = +(elem.attr('id').slice(-1));
    var prefix = '#button';
    // Check rows
    if (elem.nextUntil('br').add(elem.prevUntil('br')).filter(match).length == 2) {
      return true;
    }
    // Check columns
    if ($(prefix + (index % 3)).add($(prefix + (index % 3 + 3))).add($(prefix + (index % 3 + 6))).filter(match).length == 3) {
      return true;
    }
    // Check diagonals
    if ($(prefix + 0).add($(prefix + 4)).add($(prefix + 8)).filter(match).length == 3) {
      return true;
    }
    if ($(prefix + 2).add($(prefix + 4)).add($(prefix + 6)).filter(match).length == 3) {
      return true;
    }
    return false;
  }
});

function Xmove(board) {
  for (var i = 0; i < 9; i++){
    if (!$('#button' + i).is('.X-selected, .O-selected')){
      return i;
    }
  }
}

function Xturn(board){
  $('#button' + Xmove(board)).trigger("click");
  return;
}

function Omove(board) {
  for (var i = 0; i < 9; i++){
    if (!$('#button' + i).is('.X-selected, .O-selected')){
      return i;
    }
  }
}

function Oturn(board){
  $('#button' + Omove(board)).trigger("click");
  return;
}

function resetGame() {
    isXTurn = true;
    $('div').removeClass('X-won O-won no-win X-selected O-selected');
    $('.button').html('');
  if (xBot) {
    Xturn(board);
  }
}