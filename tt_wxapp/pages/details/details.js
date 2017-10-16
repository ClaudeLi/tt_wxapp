// details.js
import { loadDetailData, getSchoolCommentData, formatCountToSring } from "../../utils/netTools.js"

var currentPage = 0;
var detail_id = 0;
Page({

  /**
   * 页面的初始数据
   */
  videoContext: 0,
  data: {
    data: {
      comment_count: 0,
    },                          // 详情页数据
    video_items: [],            // 播放列表
    related_school: [],         // 相关课程
    user_items: {},             // up主信息
    currentItem: {},            // 当前播放的item
    playIndex: 0,               // 播放下标

    hot_comment: [],            // 热门评论
    all_comment: [],            // 全部评论
    isHasMore: true,            // 是否有更多评论
    isLoading: false,           // 是否正在加载

    tt_loop_status: false,      // 是否单节循环
    tt_mirror_status: false,    // 是否镜面
    tt_speed_status: '1.0',     // 播放速度

    input_status: false,        // 输入状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    currentPage = 0;
    detail_id = options.id;
    var self = this;
    loadDetailData(detail_id).then(resp => {
      wx.hideLoading();
      console.log('详情页数据:');
      console.log(resp.data);
      if (resp.data.status == 1) {
        var data = resp.data.data;
        wx.setNavigationBarTitle({
          title: data.title,
        });
        var related_school = [];
        for (var item of data.related_school) {
          item.hit_count = formatCountToSring(item.hit_count);
          related_school.push(item);
        }
        self.setData({
          data: data,
          video_items: data.video_items,
          related_school: related_school,
          user_items: data.user_items,
          currentItem: data.video_items[0],
        })
      } else {
        wx.showToast({
          title: resp.data.message,
        })
      }
    });
    self.addComment();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoContext = wx.createVideoContext('tt-player')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 加载评论
  addComment: function () {
    if (!this.data.isLoading) {
      this.setData({
        isLoading: true
      });
      if (this.data.isHasMore) {
        ++currentPage;
        var self = this;
        wx.showNavigationBarLoading();
        getSchoolCommentData(detail_id, currentPage).then(resp => {
          wx.hideNavigationBarLoading();
          if (resp.data.status == 1) {
            var all = resp.data.data.general;
            var hot = resp.data.data.hot;
            console.log('第' + currentPage + '页' + '评论:');
            console.log(resp.data);
            var hasMore = all.length < 5 ? false : true;
            all = self.data.all_comment.concat(all);
            hot = self.data.hot_comment.concat(hot);
            self.setData({
              all_comment: all,
              hot_comment: hot,
              isHasMore: hasMore,
              isLoading: false
            });
          } else {
            wx.showToast({
              title: resp.data.message,
              icon: 'success'
            })
          }
        });
      } else {
        console.log("没有更过评论");
      }
    }
  },

  // 评论点赞
  tapCommentLike: function (event) {
    // console.log(event.currentTarget.dataset.item);
    var index = event.currentTarget.id;
    var commentType = event.currentTarget.dataset.type;
    var arr = [];
    if (commentType == 0) {
      arr = this.data.hot_comment;
    } else if (commentType == 1) {
      arr = this.data.all_comment;
    } else {
      return;
    }
    if (arr.length > index) {
      if (arr[index].comment.like_status == 1) {
        arr[index].comment.like_status = 0;
        arr[index].comment.like_count = parseInt(arr[index].comment.like_count) - 1;
        wx.showToast({
          title: '取消点赞',
        })
      } else {
        arr[index].comment.like_status = 1;
        arr[index].comment.like_count = parseInt(arr[index].comment.like_count) + 1;
        wx.showToast({
          title: '点赞评论',
        })
      }
      if (commentType == 0) {
        this.setData({
          hot_comment: arr
        });
      } else {
        this.setData({
          all_comment: arr
        });
      }
    }
  },

  // 写评论
  writeComment: function () {
    if (!this.data.input_status) {
      this.setData({
        input_status: true
      });
    }
  },

  // 取消输入状态
  bindblurHandle: function () {
    if (this.data.input_status) {
      this.setData({
        input_status: false
      });
    }
  },

  // 点击videoItem
  tapVideoItem: function (event) {
    var index = event.currentTarget.id;
    if (index == this.data.playIndex) {
      this.videoContext.play();
      console.log("该视频正在播放中~");
      return;
    } else {
      this.setVideoItem(index);
    }
  },

  setVideoItem: function (index) {
    var item = this.data.video_items[index];
    console.log(item);
    this.setData({
      currentItem: item,
      playIndex: index
    });
  },

  // 播放结束
  playEndHandle: function (e) {
    var index = this.data.playIndex;
    ++index;
    if (this.data.video_items.length > index) {
      this.setVideoItem(index);
    } else {
      index = 0;
      this.setVideoItem(index);
    }
  },

  // 开始播放
  bindplayHandle: function () {
    console.log('开始播放');
    // 执行设置倍速
    this.videoContext.playbackRate(parseFloat(this.data.tt_speed_status));
  },

  // 播放器操作
  tap_player_loop: function (e) {
    var loopStaus = !this.data.tt_loop_status;
    this.setData({
      tt_loop_status: loopStaus
    });
  },
  tap_player_mirror: function (e) {
    var mirrorStatus = !this.data.tt_mirror_status;
    this.setData({
      tt_mirror_status: mirrorStatus
    });
  },
  tap_player_speed: function (e) {
    var speed = this.data.tt_speed_status;
    if (speed == '1.0') {
      speed = '0.8';
    } else if (speed == '0.8') {
      speed = '0.5';
    } else {
      speed = '1.0';
    }
    this.videoContext.playbackRate(parseFloat(speed));
    this.setData({
      tt_speed_status: speed
    });
  },

})