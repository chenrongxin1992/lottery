/*
* Photo Lottery
* Author: Kris Zhang
* Lincense: MIT
* https://github.com/newghost/js-lottery.git
*/
/*
Fix old IE.
*/
var Audio = Audio || function() { 
  var self  = this;
  self.play = self.stop = new Function();
};


var Lottery = (function() {
  var delete_el = null,
      delete_id = null

  var timer           = null,
      itemWidth       = 142,
      itemCount       = 0,
      curPos          = 0;

  var stopAudio       = new Audio("/lottery/ping.mp3")
    , backAudio       = new Audio("/lottery/3394.wav")
    ;

  var $container      = $("#lottery-container"),
      $content        = $("#lottery-container ul"),
      $item           = $("#lottery-container ul li"),
      $hero           = $("#lottery-hero img"),
      $hero_name      = $('#lottery-hero p');

  var init = function() {

    //Pre-caculate the count of items
    itemCount       = $item.size();
    //Clone the contents
    //$content.append($content.html());
  };

  var start  = function() {
    if(delete_el){
      console.log('开始剔除元素-->',delete_el)
      delete_el.remove()
      console.log('元素id-->',delete_id)
      //提交
      $.ajax({
        url:'/lottery/delete_el', 
        async:true,
        dataType:'json',
        type:'POST',
        data:{
          _id:delete_id,
        },
        success: function(result){
          console.log('remove success')
          console.log(result)
        },
        error: function(e){
          console.log("error");
        },
      });

    }
    clearInterval(timer);

    backAudio.play();
    stopAudio.pause();

    timer = setInterval(function() {

      curPos = parseInt($content.css("left")) | 0;
      curPos -= itemWidth / 2;

      (curPos < 0 - itemWidth * itemCount) && (curPos = 0);

      $content.css("left", curPos);

    }, 50);

    // $hero.hide();
    // $hero_name.hide()
  };

  var stop = function() {
    clearInterval(timer);
    timer = null;

    backAudio.pause();
    stopAudio.play();

    //Roll at the half width?
    (curPos % itemWidth == 0 - itemWidth / 2) && (curPos = curPos - itemWidth / 2);

    var selected  = getCurIdx();

    setCurIdx(selected);
  };

  var running = function() {
    return timer != null;
  };

  //Index: first item on the left
  var setCurIdx = function(idx) {
    curPos = (0 - idx) * itemWidth;

    var $items = $("#lottery li img"),
        imgUrl = $items.eq(idx + 3).attr("src");

    let title = $items.eq(idx + 3).attr("title"),
        attr = $items.eq(idx + 3).attr("attr");
    //let imgUrl = $content.eq(idx + 3).attr('src')
    console.log('剩下-->',$items.size())

    $content.css("left", curPos);
    $hero.attr("src", imgUrl).show("slow");
    $hero_name.text(title).show('slow')
    console.log('name-->',title)
    delete_el = $('#'+attr)
    delete_id = attr
    console.log('待剔除-->',$items.eq(idx + 3),delete_el)

    console.log($hero_name)
    console.log(curPos, idx);
  };

  var getCurIdx = function() {
    return (0 - curPos) / itemWidth;
  };

  return {
      init: init
    , start: start
    , stop: stop
    , running: running
    , setCurIdx: setCurIdx
    , getCurIdx: getCurIdx
  };

})();

$(document).ready(function() {
  Lottery.init();
});

$(document).keydown(function(e) {
    var key = e.keyCode;
    if (key != 32 && key != 13) return;

    Lottery.running()
      ? Lottery.stop()
      : Lottery.start();
});