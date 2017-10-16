//app.js
App({
  onLaunch: function() {
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('login code：' + res.code);

          // 发起网络请求
          // https://api.weixin.qq.com/sns/jscode2session 由服务器请求
          // wx.request({
          //   url: 'https://api.weixin.qq.com/sns/jscode2session',
          //   data: {
          //     js_code: res.code,
          //     appid: 'wx7e953d2686228398',
          //     secret:'01409a420926469c03e76ecdc3ad05dd',
          //     grant_type: 'authorization_code',
          //   },
          //   success: function (res) {
          //     console.log(res.data)
          //   }
          // })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });



    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          console.log(res);
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})
