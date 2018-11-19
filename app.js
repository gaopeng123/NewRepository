App({
  onLaunch() {

    var than = this;

    //修改  后来进入直播到人无法听到背景音乐；
    wx.request({
      method: 'POST',
      url: "https://tmp.servera.com.cn/fncrpt/bacMusic/getStatus",
      success: function(res) {
        console.log(res)
        if (res.data == '00001') {
          //开始
          than.globalData.backMusic = true;
          than.globalData.innerAudioContext.src = 'http://tmp.servera.com.cn/image/xiaochengxu/bj.mp3';
          setTimeout(function() {
            than.globalData.innerAudioContext.play();
          }, 500)
        } else if (res.data == '00002') {
          //暂停
          than.globalData.backMusic = false;
          than.globalData.innerAudioContext.pause();
        }
      }
    })


    //建立连接
    wx.connectSocket({
      // url: 'ws://192.168.199.122:8080/websocket',
      url:'wss://tmp.servera.com.cn/fncrptws/websocket',
    })
    //打开
    wx.onSocketOpen(function(res) {
      console.log(res)
      // console.log('WebSocket连接已打开！')
    })
    //接收
    wx.onSocketMessage(function(res) {
      if (res.data == 'endBacMusic'){
        if (than.globalData.backMusic === true){
          than.globalData.backMusic = false;
          than.globalData.innerAudioContext.pause();
        }
      } else if (res.data == 'startBacMusic'){
        if (than.globalData.backMusic === false){
          than.globalData.backMusic = true;
          than.globalData.innerAudioContext.play();
        }
      } else {
        processDate(JSON.parse(res.data));
        
      }
    })
    setInterval(function () {
      wx.sendSocketMessage({
        data: "bacMusic",
        fail: function (res) {
          //建立连接
          wx.connectSocket({
            // url: 'ws://192.168.199.122:8080/websocket',
            url:'wss://tmp.servera.com.cn/fncrptws/websocket',
          })
        }
      })
    }, 5000)
    wx.login({
      success: function() {
        wx.getUserInfo({
          success: function(res) {
            than.globalData.userInfo = res.userInfo;
          },
          fail:function(res){
            console.log(res)
          }
        })
      }
    })
    var socketOpen = false;
    var socketMsgQueue = [];
    wx.onSocketOpen(function(res) {
      socketOpen = true
      for (var i = 0; i < socketMsgQueue.length; i++) {
        sendSocketMessage(socketMsgQueue[i])
      }
      socketMsgQueue = []
    })

    function sendSocketMessage(msg) {
      if (socketOpen) {
        wx.sendSocketMessage({
          data: msg
        })
      } else {
        socketMsgQueue.push(msg)
      }
    }

    than.globalData.backMusic = false;
    setTimeout(function(){
      if (than.globalData.userInfo != undefined) {
        sendSocketMessage("name:" + than.globalData.userInfo.nickName +
          ';img:' + than.globalData.userInfo.avatarUrl);
      }
    },1000)
    setInterval(function() {
      if (than.globalData.userInfo != undefined) {
        sendSocketMessage("name:" + than.globalData.userInfo.nickName +
          ';img:' + than.globalData.userInfo.avatarUrl);
      }
    }, 60000);
    function processDate(data) {
      console.log(data)
      // data.time = '2018-07-19 20:28:29';
      than.globalData.innerAudioContext.loop = true;
      than.globalData.innerAudioContext.src = 'http://tmp.servera.com.cn/image/xiaochengxu/bj.mp3';
      //准备跳转
      if (data.message == 'getWxlist') {
        //默认倒计时
        than.globalData.w_meetTime = data.time;
        than.globalData.serverTime = data.serverTime;
        // than.globalData.innerAudioContext.play();
      } else if (data.message == 'startBackgroundMusic') {
        //是否在打电话
        wx.request({
          method: 'POST',
          url:
            "https://tmp.servera.com.cn/fncrpt/askStatus/getStatus",
          success: function (res) {
            // console.log(res)
            if (res.data == '00001') {
              //开始
              than.globalData.backMusic = true;
              than.globalData.innerAudioContext.play();
              than.globalData.innerAudioContext.volume = 0.3;
            }else{
              //开始
              than.globalData.backMusic = true;
              than.globalData.innerAudioContext.play();
              than.globalData.innerAudioContext.volume = 1;
            }
          }
        })
        
      } else if (data.message == 'suspendBackgroundMusic') {
        //暂停
        than.globalData.backMusic = false;
        than.globalData.innerAudioContext.pause();
      } else if (data.message == 'startAskingQuestions') {
        than.globalData.w_show = true;
      } else if (data.message == 'endAskingQuestions') {
        than.globalData.w_show = false;
      } else if (data.message == 'endLive') {
        than.globalData.meetEnd = false;
      }
    }
  },
  onShow: function() {
    var than = this;
    if (than.globalData.backMusic) {
      than.globalData.innerAudioContext.play();
    }
  },
  globalData: {
    innerAudioContext: wx.createInnerAudioContext(),
    w_show:false,
    meetEnd: false
  }
})