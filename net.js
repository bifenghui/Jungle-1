/*
 *  @author: chen jinsheng 
 *  @date: 2017-11-15
 */

var ta = document.getElementById('responseText');
var dialog = $('.dialog-box');
var h6 = $('.box-right h6');
var notouch  = $('.no-touch');
//结果弹窗变量
var stime = null;
var number = 0;
var ss = 5; //5秒后开始游戏


var token = $.cookie('_ac') || "aaa";
var nickname = $.cookie('_nickname') || "bbb";
var uid = $.cookie('_uid') || 200442525;
// var uid = $.cookie('_uid') || 140006652;
var headpic = $.cookie('_headpic') || "ccc";

var URL;
URL = "ws://xxxxxxx/ws"
// if (typeof $.cookie('_ac') !=='undefined') {
// 	//客户端地址   新
// 	URL = "ws://xxxxxxx/ws"
// }
// else{
// 	//本地地址
// 	// URL = "ws://xxxxxxx:8080/ws?uid=1996280991747&token="+encodeURIComponent(token)
// 	URL = "ws://xxxxxxx/ws"
// }
var receviced = {
	getUser1: function (data) {
		data.headPic && $('.user1 .user-img').attr('src',data.headPic);
		data.nickName && $('.user1 .nick-bar').text(data.nickName);
	},
	getUser2: function (data) {
		data.headPic && $('.user2 .user-img').attr('src',data.headPic);
		data.nickName && $('.user2 .nick-bar').text(data.nickName);
		$('.dialog-match').addClass('hidden');


	},
	// 认输按钮
	isGiveUp: function () {
		$('.give-up-box').addClass('show');
		$('#giveup-btn').attr('side',mySide);
	},
	deal1: function (data){
		var _ts = this;
		$('#match').text('匹配成功。。。');
		// ta.innerHTML = '游戏中!!';
	}


};
/*处理接收服务器message*/
NetSoket.netWebSoket(URL,function (head, body) {
	GAME._receiveMsg(head, body);


},function (event) {
	//连接建立成功
	console.info("connect success!")
    console.info("login start...")
	GAME.login(token, parseInt(uid), nickname, headpic);
    // console.info("login success...")

},function (event) {
	//连接被关闭
    console.warn("connect closed!")
});

