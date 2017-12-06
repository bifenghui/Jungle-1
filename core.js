/*
1
1、初始化棋子为一维随机数组
2、
 */
//双方棋子数，1：蓝色方，0：红色方 ，红色先下
var _GREEN = 1;
var _RED = 0;
var aNum={ 0 : 8, 1 : 8}
//点击某个棋子是，标识其上下左右是否可走 1 可走 0 不可走
var dtop = dright = dbottom = dleft = 0;
var mySide;
var gameId;
var turn;
var timeInter1 = null; //开始游戏倒计时
var timeInter2 = null; //倒计时
var timeOut_show_1 = null; //你的回合，显示的倒计时
var timeOut_hide_1 = null; //你的回合，隐藏的倒计时
var timeOut_show_2 = null; //对方回合，显示的倒计时
var timeOut_hide_2 = null; //对方回合，隐藏的倒计时
var gameTimeLock = 1; // 1：锁住，0：解锁
var audio2; //背景音频
var uid = 0;
var nickname = "";
var headpic = "";
var gameType = 2;
var csType = 204;
var GAME = {
		//匹配成功-初始化
		init : function(msgJson){
			var randomAnimals = msgJson.data;
			var	animalName = ['象', '狮', '虎', '豹', '狼', '狗', '猫', '鼠'],
				domAnimalName = [];

			//0 先走， 1 后走
			mySide = msgJson.side;
            gameId = msgJson.gameId;
            turn = 0;

			// 组合棋子数组
			// &&输出到dom
			for(var i = 0, l = randomAnimals.length; i < l; ++i){
				domAnimalName[i] = {team:'',name:''};
                domAnimalName[i].team = randomAnimals[i];
				// domAnimalName[i].team = randomAnimals[i];
				domAnimalName[i].name = animalName[Math.abs(randomAnimals[i]) -1];
				$('.animals').append($('<div class="animal hide animal'+(i+1)+' obj-animal'+domAnimalName[i].team+'"></div>').attr("team", domAnimalName[i].team).text(domAnimalName[i].name));
				$('.animals').append($('<span class="blank blank'+(i+1)+'"></span>'));
				// piecesArray.push(new Pieces(animalName[Math.abs(randomAnimals[i]) -1], randomAnimals[i],i%4,Math.floor(i / 4)));
			}
			$('.animals').append('<div id="smog-layer"><span class="s-somg"></span></div>');
			//  添加坐标
			$('.animal').each(function(i){
				$(this).data('coordinate',{x:i % 4,y:Math.floor(i / 4)});
				$(this).data('status',true);
				$(this).addClass("c"+i % 4+Math.floor(i / 4));
                $(this).data('side',domAnimalName[i].team > 0 ? _RED : _GREEN);

			});

			receviced.isGiveUp();//认输按钮
			// receviced.getUser2(msgJson);

			if (msgJson.side===0) {
				$('.dialog-layer').addClass('dialog-side'+msgJson.side);
				$('.side1').addClass('r-color').text('你是红方');
				$('.user1 .litte-bar3').hide();
				$('.user1').removeClass('green-team').addClass('red-team');
				$('.user2').removeClass('red-team').addClass('green-team');

				$('.p1').removeClass('green-team').addClass('red-team');
				$('.p2').removeClass('red-team').addClass('green-team');
			}
			else{
				$('.side1').addClass('g-color').text('你是蓝方');
				$('.user1 .litte-bar3').hide();
				$('.dialog-layer').addClass('dialog-side'+msgJson.side);
				$('.user1').removeClass('red-team').addClass('green-team');
				$('.user2').removeClass('green-team').addClass('red-team');

				$('.p1').removeClass('red-team').addClass('green-team');
				$('.p2').removeClass('green-team').addClass('red-team');
			}
			//游戏开始 提示
			GAME.startTips();
			GAME.setCurrentSide(0);
			//初始化
			if (msgJson.status === true) {

				if (msgJson.side === 0) {
					GAME.turnMySide();
					
				}
				else if (msgJson.side === 1) {
					GAME.turnSideOthers();
					
				}
			}
			//音频
			audio2 = document.getElementById("audio-loop");
			// audio2.autoplay = true;
			audio2.loop = true;
		    audio2.src = "http://bimg.xoyo.com/publish/jx3/mp3/tianyuan.mp3";

    		// audio2.play();
		    

		    //点击音乐按钮
        //     $('body').on('click','.music-btn',function () {

        //     	if( $(this).hasClass('stop') ) {
	       //      	$(this).removeClass('stop');
        //     		audio2.play();
        //     	}
        //     	else {
	       //      	$(this).addClass('stop');
				    // audio2.pause();

        //     	}
        //     });

		},
		//游戏开始提示
		startTips: function () {
			$('.dialog-start-tips').show();
			var i = 2;
			timeInter1 = setInterval(function () {
				
				// console.info(i);
				if (i===0) {
					clearInterval(timeInter1);
					$('.dialog-start-tips').hide();
					GAME.setGameTime(60);
					gameTimeLock = 0;

				}
				else {
					$('.dialog-start-tips p').text(i+'s');
					i--;
				}
			},1000);
		},
		//游戏倒计时
		setGameTime: function (s) {

			$('.time-box.show .time').text(s);
			clearInterval(timeInter2);

			timeInter2 = setInterval(function () {
			// console.info(s)
				if (s===0) {
					// var side = $('.time-box.show').attr('now-side');
					var side = GAME.getCurrentSide();
					var result = side == 1 ? 0 : 1; //蓝 发 0，红 发 1；

					clearInterval(timeInter2);
					$('.time-box').removeClass('show'); //隐藏定时器

		            GAME.gameOverSend(result); //相当于认输
				    // $('#giveup-btn').trigger('click');

				}
				else {
					$('.time-box.show .time').text(--s); //显示秒数
				}
			},1000);
		},
		showEach1: function () {
			$('.p1').show();
		},
		hideEach1: function () {
			$('.p1').hide();
		},
		showEach2: function () {
			$('.p2').show();
		},
		hideEach2: function () {
			$('.p2').hide();
		},
		turnMySide: function () {
			$('.time-box').removeClass('show').eq(0).addClass('show'); //显示倒计时
			
			clearTimeout(timeOut_show_1);
			clearTimeout(timeOut_hide_1);
			if (gameTimeLock===0) { //解锁后
				// setTimeout(function () {
				// 	GAME.hideEach1();
				// },2000);
				timeOut_show_1 = setTimeout(function () {
					GAME.showEach1();
					timeOut_hide_1 = setTimeout(function () {
						GAME.hideEach1();
					},1000);
				},1200);

				GAME.setGameTime(60);

			}
		},
		turnSideOthers: function () {
			$('.time-box').removeClass('show').eq(1).addClass('show'); //显示倒计时

			clearTimeout(timeOut_show_2);
			clearTimeout(timeOut_hide_2);
			if (gameTimeLock===0) { //解锁后
				// setTimeout(function () {
				// 	GAME.hideEach2();
				// },2000);
				timeOut_show_2 = setTimeout(function () {
					GAME.showEach2();
					timeOut_hide_2 = setTimeout(function () {
						GAME.hideEach2();
					},1000);
				},1200);

				GAME.setGameTime(60);
			}

		},


		_activeCard : function(ths){
			$('.active').removeClass('active').addClass('normal');
			ths.addClass('active').removeClass('normal');
			var coordinate = ths.data('coordinate');
			GAME.deriction(coordinate);
		},
		deriction : function(coordinate){
			$('.deriction').remove();
			dtop = dright = dbottom = dleft = 0;
			if(coordinate.x === 0 && coordinate.y === 0){
				//左上角
				dright = dbottom = 1;

				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
					
			}else if(coordinate.x === 3 && coordinate.y === 3){
				// 右下角
				dleft = dtop = 1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}else if(coordinate.x === 3 && coordinate.y === 0){
				// 右上角
				dleft = dbottom = 1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}else if(coordinate.x === 0 && coordinate.y === 3){
				// 左下角
				dright = dtop = 1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}else if(coordinate.y === 0){
				// 顶部
				dright = dbottom = dleft = 1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}else if(coordinate.x === 3){
				// 右侧
				dtop = dbottom = dleft = 1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}else if(coordinate.y === 3){
				// 左侧
				dtop = dright = dleft =1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}else if(coordinate.x === 0){
				// 底部
				dtop = dright = dbottom = 1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}else{
				dtop = dright = dbottom = dleft = 1;
				GAME.judge(dtop, dright, dbottom, dleft, coordinate);
			}
			GAME.findNext(dtop, dright, dbottom, dleft, coordinate);
			// $('.active').append('<div class="deriction"><div class="top '+(dtop?'':'none')+'"></div><div class="right '+(dright?'':'none')+'"></div><div class="bottom '+(dbottom?'':'none')+'"></div><div class="left '+(dleft?'':'none')+'"></div></div>');
		},
		compare : function(judgeThis,judgeObj,judgeDeriction){
			if(judgeThis.length == 0){
				// 没有棋子
				judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0 ; 
			}else{
				if(judgeThis.hasClass('hide')){
					//未翻牌
					judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0 ; 
				}else{
					if(judgeThis.attr('team') * judgeObj.attr('team') > 0){
						// 同一方的棋子
						judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0 ; 
					}else {
						// 级别比自己大
						// var ths = Math.abs(judgeThis.attr('team'));
						// var obj =  Math.abs(judgeObj.attr('team'));
                        // if(ths < obj) {
                         //    if (ths != 1 || obj != 8) {
                         //    	judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0;
                        	// }
                        // }else{
                         //    if (ths == 8  && obj == 1) {
                         //        judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0;
                         //    }
						// }
					}
				}
			}
			
		},
		judge : function(t, r, b, l, c){
			// 找到对应方向的对象
			if(t){//dtop
				var _this = $('.c'+c.x+(c.y-1)),
					_obj = $('.c'+c.x+c.y);
					GAME.compare(_this, _obj, 't');

			}
			if(r){//dright
				var _this = $('.c'+(c.x+1)+c.y),
					_obj = $('.c'+c.x+c.y);
					GAME.compare(_this, _obj, 'r');
			}
			if(b){//dbottom
				var _this = $('.c'+c.x+(c.y+1)),
					_obj = $('.c'+c.x+c.y);
					GAME.compare(_this, _obj, 'b');
			}
			if(l){//dleft
				var _this = $('.c'+(c.x-1)+c.y),
					_obj = $('.c'+c.x+c.y);
					GAME.compare(_this, _obj, 'l');
			}
		},
		findNext : function(t, r, b, l, c){
			$('.next').removeClass('next').addClass("normal");
			if(t){
                if($('.c'+c.x+(c.y-1)).data("status")){
                    $('.c'+c.x+(c.y-1)).addClass('next').removeClass('normal');
				}
			}
			if(r){
				if($('.c'+(c.x+1)+c.y).data("status")) {
                    $('.c' + (c.x + 1) + c.y).addClass('next').removeClass('normal');
                }
			}
			if(b){
                if($('.c'+c.x+(c.y+1)).data("status")) {
                    $('.c' + c.x + (c.y + 1)).addClass('next').removeClass('normal');
                }
			}
			if(l) {
                if($('.c' + (c.x - 1) + c.y).data("status")) {
                    $('.c' + (c.x - 1) + c.y).addClass('next').removeClass('normal')
                }
            }
		},
		afterSend: function () {
			//如果是游戏结束，有定时器，需要清定时器
			// console.info('========')
			GAME.turnSideOthers();

			var cur = 1;
			if ($('#giveup-btn').attr('side') ==1) {
				cur = 0;
			}
			// console.info('cur',cur);
			GAME.setCurrentSide(cur);

		},
		move: function(active,next) {
            //_A 主动， _B 被动
            var _B = $(this);
            var _A = $(".active");

            if(turn % 2 != mySide){
            	return;
			}
            if (_A.length == 0) {
                return;
            }

            if(mySide != _A.data("side")){
            	return;
			}


            GAME._move(_A, _B);
            var msg = {type:2,op:9,"gameId": gameId,from:{x:_A.data('coordinate').x,y:_A.data('coordinate').y},to:{x:_B.data('coordinate').x,y:_B.data('coordinate').y},"side": mySide, step:2};

            GAME.messgSend(msg);
            GAME.afterSend();//动作轮到对方



        },
		_move: function(_A, _B){
			var bCoo = _B.data('coordinate'),
				bCooX = bCoo.x,
				bCooY = bCoo.y,
				bPosT = _B.css('top'),
				bPosL = _B.css('left'),
			// $(this).detach();
				bTeam = _B.attr('team'),
				bStatus = _B.data('status'),
				bSide = _B.data('side');


            var aCooX = _A.data('coordinate').x,
                aCooY = _A.data('coordinate').y,
                aPosT = _A.css('top'),
                aPosL = _A.css('left'),
            	aTeam = _A.attr('team'),
                aStatus = _A.data('status'),
            	aSide = _A.data('side');


			var dis = Math.sqrt(Math.pow((aCooY - bCooY),2) + Math.pow((aCooX - bCooX),2));
			//距离大于1 不让动
			if(dis > 1){
				return;
			}

			//判断谁大，1： A 大， 0： 一样大， -1： B 大
            var isBigger =  GAME.compareAnimal(aTeam,bTeam);

            $('.next').removeClass('next').addClass("normal");
            _A.find('.deriction').detach();


        	
            _A.animate({top:bPosT,left:bPosL},400,"linear",function () {

                if (bStatus) {

		        	GAME.addSmog(bPosT,bPosL); 

					// 对方还活着
					if (isBigger == 0) {
						//同归于尽



                        _A.data('coordinate').x = bCoo.x;
                        _A.data('coordinate').y = bCoo.y;
                        _A.removeClass('c' + aCooX + aCooY).addClass('c'+bCoo.x+bCoo.y);
                        _A.data('status', false);
                        _A.removeClass("active").addClass("die");


                        _B.data('coordinate').x = aCooX;
                        _B.data('coordinate').y = aCooY;
                        _B.removeClass('c' + bCooX + bCooY);
                        _B.removeClass('normal');
                        _B.addClass('c' + aCooX + aCooY);
						_B.data('status', false);
                        _B.addClass("die");
                        _B.css({top: aPosT, left: aPosL});

                        GAME.counter(0);
                        GAME.counter(1);
                    }
					else if (isBigger > 0) {
						//大于对方,吃掉对方


                        _A.data('coordinate').x = bCoo.x;
                        _A.data('coordinate').y = bCoo.y;
                        _A.removeClass('c' + aCooX + aCooY).addClass('c'+bCoo.x+bCoo.y);
                        _A.removeClass("active").addClass('normal');


                        _B.data('coordinate').x = aCooX;
                        _B.data('coordinate').y = aCooY;
                        _B.removeClass('c' + bCooX + bCooY);
                        _B.removeClass('normal');
                        _B.addClass('c' + aCooX + aCooY);
						_B.addClass("die");

                        _B.data('status', false);
                        _B.css({top: aPosT, left: aPosL});


                        GAME.counter(bSide);

                    }
					else if (isBigger < 0 ) {
						//小于对方，被对方吃掉
                        _A.data('status', false);
                        _A.removeClass("active").addClass("die");

                        _A.data('status', false);
                        _A.removeClass("active").addClass("die");
                        _A.css({top: aPosT, left: aPosL});

                        GAME.counter(aSide);
					}
            	}else{
                    //对方已死，相当于位移
                    _A.data('coordinate').x = bCoo.x;
                    _A.data('coordinate').y = bCoo.y;
                    _A.removeClass('c' + aCooX + aCooY).addClass('c'+bCoo.x+bCoo.y);
                    _A.removeClass("active").addClass('normal');


                    _B.data('coordinate').x = aCooX;
                    _B.data('coordinate').y = aCooY;
                    _B.removeClass('c' + bCooX + bCooY);
                    _B.removeClass('normal');
                    _B.addClass('c' + aCooX + aCooY);

                    _B.css({top: aPosT, left: aPosL});
				}



                var isOver = GAME._isOver();
                if(isOver != 0) {
                    // if (isOver > 0) {
                    //     alert("红方剩");
                    // } else if (isOver < 0) {
                    //     alert("蓝方剩");
                    // }
					GAME._gameOver();
                }
			});

            turn ++;
        },
        //烟雾效果
        addSmog: function (bPosT,bPosL,callback) {
        	var ss = null;
        	var i = 1;
        	$('#smog-layer').css({'display':'block','top':bPosT,'left':bPosL});

        	ss = setInterval(function () {
        		
        		if (i>4) {
        			clearInterval(ss);
        			$('#smog-layer').css({'display':'none'});
        			return;
        		}

        		$('#smog-layer .s-somg').css({'background-image':'url(./images/animation_0'+i+'.png)'});
        		
        		i++;

        	},70);
        	// if (typeof callback == 'function') {
        	// 	callback();
        	// }
        },

		//翻牌，传入
		_showCard : function(ths){

		    ths.addClass('animated shake'); //加上动画 shake
			ths.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () { //检查是否做完动画
				
				//做完动画后
				if(ths.data('side') == _RED){
					// ths.css({background:'red',textIndent:0}).removeClass('hide').addClass('normal');
					ths.addClass('red-show').removeClass('hide').addClass('normal');
				}else{
					// ths.css({background:'green',textIndent:0}).removeClass('hide').addClass('normal');
					ths.addClass('green-show').removeClass('hide').addClass('normal');
				}
	            turn ++;

				$(".animal").removeClass("animated shake"); //删除动画
				$(".animal.active").removeClass("active").addClass("normal");
	            $(".animal.next").removeClass("next").addClass("normal");
	        	$(".animal").find('.deriction').detach();
			});

   		 },

		//判断是否结束，返回0：未结束，1：红色方赢，-1：蓝色方赢 =====【非认输情况】
        _isOver : function () {
			console.log(aNum);
            if(aNum[_GREEN] == 0){
            	return 1;
			}
			if(aNum[_RED] == 0){
            	return -1;
			}
			return 0;
        },

		//判断动物大小，传入数字，返回 0:一样大，1：animal1 大， -1 ：animal2 大
        compareAnimal : function (animal1, animal2) {
            animal1 = Math.abs(animal1);
            animal2 = Math.abs(animal2);
            if(animal1 == animal2){
            	return 0;
			}
            if(animal1 > animal2 && (animal1 != 8 || animal2 != 1)){
            	return -1;
			}
			else if(animal1 == 1 &&  animal2 == 8){
            	return -1;
			}
			else
			{
				return 1;
			}
        },

		//游戏结束，上报给服务端
		_gameOver:function () {
			//输方发给服务器
			var result = 2;
            if(aNum[_GREEN] === 0 && aNum[_RED]!==0){
                result =  0; //输了，蓝方发 0
            }
            if(aNum[_RED] === 0 && aNum[_GREEN] !==0){
                result = 1; //输了，红方发 1
            }
            if(aNum[_RED] === 0 && aNum[_GREEN] ===0){
                result = 2; //输了，任意一方发2
            }
            // console.info('result:',result);
            GAME.gameOverSend(result);
        },
        gameOverSend: function (result) {
        	var msg = {type:2,op:13,"gameId": gameId,"side": mySide, "result":result, "data":{"a":aNum[_RED], "b": aNum[_GREEN]}};

            GAME.messgSend(msg);
        	GAME.afterSend();
        },
		//处理服务端下发的游戏结束消息
		gameOver:function (msgJson) {
			//接收：结束处理
			var server = msgJson;
			//animals层添加禁止层
			// $('.animals').addClass('stop-layout');
			//弹窗
			$('.dialog-layer .dialog-p').text(server.msg);
			$('.dialog-layer').addClass('show');
			$('.dialog-middle-box').remove(); // 删除x方的回合
			if (server.side===0) { // 红方
				if (server.result===1) { // 红输
					$('.dialog-side0').addClass('lose');
					$('.dialog-side1').addClass('win');
				}
				if (server.result===0) { // 绿输q
					$('.dialog-side0').addClass('win');
					$('.dialog-side1').addClass('lose');
				}
			}
			else if (server.side===1) { //绿方
				if (server.result===1) { // 红输
					$('.dialog-side0').addClass('lose');
					$('.dialog-side1').addClass('win');
				}
				if (server.result===0) { // 绿输
					$('.dialog-side0').addClass('win');
					$('.dialog-side1').addClass('lose');
				}
			}
			//清楚定时器
			clearInterval(timeInter2);
			$('.time-box').removeClass('show');
			$('.give-up-box').hide();
			//隐藏‘你的回合&对手回合’
			// $('.turn-tip').hide();
			// 停止背景音乐
		    audio2.pause();

		},
		//设置当前side
		setCurrentSide: function (curSide) { 
			$('.time-box').attr('now-side',curSide);
			// console.info($('.time-box').attr('now-side'))
		},
		getCurrentSide: function () {
			return $('.time-box').attr('now-side');
		},
		//处理对方动作消息
    	otherSideOp :function (msgJson) {
			var step = msgJson.step;
			
			if (typeof msgJson.from !== 'undefined' ) {
				GAME.turnMySide();
				GAME.setCurrentSide(msgJson.side);
			}

			switch(step){
				case 0:
					//翻牌
                    var from = msgJson.from;
                    var cls = ".c" + from.x + from.y;
                    GAME._showCard($(cls));
                    break;
				case 1:
					//激活已经去掉
                    var from = msgJson.from;
                    var cls = ".c" + from.x + from.y;
                    // GAME._activeCard($(cls));
                    break;
				case 2:
					//走步
                    var from = msgJson.from;
                    var fromCls = ".c" + from.x + from.y;

                    var to = msgJson.to;
                    var toCls = ".c" + to.x + to.y;

                    GAME._activeCard($(fromCls));
                    GAME._move($(fromCls), $(toCls));
                    break;

				default:
					break;

			}

        },

		//棋子减一计数
        counter : function (side) {
			aNum[side] = aNum[side] - 1;
        },

		_receiveMsg : function (head, body) {
			// var msgJson = JSON.parse(msg);
			var mstType = head.type;
			if(mstType === 0){
				//登录成功
				receviced.getUser1(body);
			}
			else if(mstType ===204){
				//游戏指令
				var op = body.op
				switch(op){
					case 3:
                        GAME.ready(body);
                        break;
                    case 7:
                        //开始
                        GAME.init(body);
                        break;
					case 11:
						//游戏动作
						GAME.otherSideOp(body);
						break;
					case 15:
						//游戏结束
						GAME.gameOver(body);
						break;
					default:
						break;
				}
			}
        },
        //数组
        isArry: function (arg) {
        	var toString = Object.prototype.toString;
        	return toString.call(arg)  == '[object Array]';
        },
        getPreloadImg: function (images) {
        	var arrImg = [];
        	var preImg = this.getPreloadImg.arguments[0];

        	if ( !this.isArry(images) ) { return;}

        	for (var i = 0; i < preImg.length; i++) {
        		arrImg[i] = new Image();
        		arrImg[i].src = preImg[i];
        	}
        	console.log(arrImg[0].src) 
        },
        closeVoice: function (callback) {

        	$('.icon-little').click(function () {

				if ( $(this).hasClass('no-voice') ) {
					$(this).removeClass('no-voice');
				}
				else {
					$(this).addClass('no-voice');
				}

	        	typeof callback ==='function' && callback.call();
			});

        },
		start: function () {

			//预加载图片
			

			//事件-点击匹配
			$('#match').click(function () {
				$(this).text('匹配中。。。');

                var body = {type : 204,op:1,uid:200442525,sex:"男", gameType:2};
                GAME.messgSend(body);


			});
			//点击关掉声音
			GAME.closeVoice(function () {
				console.log('关掉声音的回调..');
			});
			//点击认输
			$('body').on('click','#giveup-btn',function () {
				var side = $(this).attr('side');
				var result = side == 1 ? 0 : 1; //蓝 发 0，红 发 1；
				if (typeof side ==='undefined') { return;}
	            GAME.gameOverSend(result);
			});

            //翻牌
            $('.animals').on('click','.hide',function () {
                var ths = $(this);
                if(turn % 2 != mySide){
                    return;
                }

                GAME._showCard(ths);
                var msg = {type:2,op:9,"gameId": gameId,from:{x:ths.data('coordinate').x,y:ths.data('coordinate').y},"side": mySide, step:0};

                GAME.messgSend(msg);
                GAME.afterSend();//动作轮到对方

            });

            //点击棋子
            $('.animals').on('click','.normal',function () {
                var ths = $(this);
                // console.info(mySide,ths.data('side'),'<=data(side)')
                if(mySide != ths.data("side")){
                    return;
                }

                GAME._activeCard(ths);

            });

            //移动到有其在的地方
            $('.animals').on('click','.next',GAME.move);

            //移动到无棋子的地方
            $('.animals').on('click','.die',GAME.move);

            

        },

	ready: function (body) {
        //
        //
        //
        //
        gameId = body.gameId
        receviced.getUser2(body);
        head = {type :204, op:5};
        body1 ={op:5, gameId:gameId, uid:uid};
        GAME.sendMsg(head, body1);
    },


    loginSuccess:function( _uid, _nickname , _headpic) {
		// uid = _uid;
        // nickname = _nickname;
        // headpic = _headpic;
        console.info("login success...")
    },

	login:function(_token, _uid, _nickname, _headpic) {
        uid = _uid;
        nickname = _nickname;
        headpic = _headpic;
		var head = { type : 0, op : 1};
		var body = {ssid : _token , uid: uid, pv : 16, phone : "13428967565", version : "1.1.1", netmode : 1, imei : "112223213123123", brand : 25};
        NetSoket.sendMsg(head, body);
	},

    messgSend: function(message) { // 接收websoket对象socket，发送message
        head = {op:message.op};
        GAME.sendMsg(head, message);

    },
	sendMsg:function (head, body) {
        body.gameType = gameType;
        head.type = csType;
        NetSoket.sendMsg(head, body);
    }
};
