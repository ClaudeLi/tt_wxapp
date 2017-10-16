// homePage.js
import {
  getHomeTitle,
  loadHomeList
} from "../../utils/netTools.js"
import {
  TT_Train_ID,
  TT_MDT_ID,
  TT_type_school,
  TT_type_elegant
} from "../../utils/constant.js"

var timerOut = 3;
var requestTimer = 0;
var screenWidth = 0;
Page(
  {
    /**
     * 页面的初始数据
     */
    data: {
      allData: [],
      titles: [],
      currentIndex: 0,
      swiperHeight: 0,
      scrollLeft: 0,
      loading: false,
    },

    // 点击cell跳转，此方法暂未使用，used: navigator
    tapCell: function (event) {
      var id = event.currentTarget.id;
      var type = event.currentTarget.dataset.type;
      console.log(event);
      if (id) {
        var url = '../details/details?id=' + id;
        wx.navigateTo({
          url: url,
        })
      }
    },

    // 切换顶部标签
    switchTab: function (e) {
      // 顶部标签联动
      console.log('生成的offsetLeft：' + e.currentTarget.offsetLeft);
      var index = e.currentTarget.dataset.index;
      this.setData({
        currentIndex: index
      });
      // 如果需要加载数据
      if (this.needLoadNewDataAfterSwiper()) {
        this.refreshNewData();
      }
    },

    // swiperChange
    bindChange: function (e) {
      var index = e.detail.current;
      var offsetLeft = 0;
      if (this.data.titles.length > index) {
        offsetLeft = this.data.titles[index].offsetLeft;
        console.log('计算的offsetLeft：' + offsetLeft);
        var offWidth = this.data.titles[index].title.length * 15 / 2.0;
        if (offsetLeft > (screenWidth / 2.0 - offWidth)) {
          offsetLeft = offsetLeft - screenWidth / 2.0 + offWidth;
        } else {
          offsetLeft = 0;
        }
      }
      this.setData({
        scrollLeft: offsetLeft,
        currentIndex: index
      });

      // 如果需要加载数据
      if (this.needLoadNewDataAfterSwiper()) {
        this.refreshNewData();
      }
    },

    needLoadNewDataAfterSwiper: function () {
      if (this.data.currentIndex < this.data.allData.length) {
        var list = this.data.allData[this.data.currentIndex].list;
        return list.length > 0 ? false : true;
      }
      return false;
    },

    // 第一次加载数据
    refreshNewData: function () {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      var self = this;
      var currentItem = this.data.allData[this.data.currentIndex];
      loadHomeList(1, currentItem.id).then(resp => {
        var list = [];
        for (var item of resp.data.data) {
          if (item.type == TT_type_school) {
            list.push(item);
          }
        }
        var allData = self.data.allData;
        allData[self.data.currentIndex].list = list;
        allData[self.data.currentIndex].page = 1;
        self.setData({
          loading: false,
          allData: allData,
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 200)
      })
    },

    // 下拉刷新
    dropDownRefresh: function () {
      var now = new Date().getTime() / 1000;
      if (requestTimer) {
        if ((now - requestTimer) < timerOut) {
          console.log("3秒内不重复请求");
          return;
        }
        requestTimer = now;
      } else {
        requestTimer = now;
      }
      this.refreshNewData();
    },

    // 上拉加载
    pullOnAddData: function () {
      console.log('上拉加载');
      var index = this.data.currentIndex;
      var allData = this.data.allData;
      var currentItem = allData[index];
      if (currentItem.hasMore) {
        var self = this;
        var currentPage = currentItem.page;
        ++currentPage;
        wx.showNavigationBarLoading();
        loadHomeList(currentPage, currentItem.id).then(resp => {
          wx.hideNavigationBarLoading();
          if (resp.data.status == 1) {
            var list = [];
            for (var item of resp.data.data) {
              if (item.type == TT_type_school) {
                list.push(item);
              }
            }
            if (list.length < 4) {
              currentItem.hasMore = false;
            } else {
              currentItem.page = currentPage;
              currentItem.hasMore = true;
            }
            var currentList = currentItem.list.concat(list);
            currentItem.list = currentList;
            allData[index] = currentItem;
            self.setData({
              allData: allData
            });
          }
        });
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      wx.showLoading({
        title: '加载中...',
      })
      var self = this;
      getHomeTitle().then(resp => {
        console.log('首页分类数据，需排除MDT, 训练 及非课程的分类：');
        console.log(resp);
        wx.hideLoading();
        var titleArray = [];
        var allDataArray = [];
        for (var item of resp.data.data) {
          // 排除MDT, 训练 及非课程的分类
          if (!(item.id == TT_Train_ID || item.id == TT_MDT_ID) && item.show_type != TT_type_elegant) {
            // 计算出文字offsetLeft写入item
            if (titleArray.length > 0) {
              item.offsetLeft = titleArray[titleArray.length - 1].offsetLeft + 20 + titleArray[titleArray.length - 1].title.length * 15;
            } else {
              item.offsetLeft = 10;
            }
            titleArray.push(item);
            allDataArray.push({
              id: item.id,
              page: 1,
              hasMore: true,
              list: []
            });
          }
        }
        self.setData({
          titles: titleArray,
          allData: allDataArray
        });
        if (allDataArray.length) {
          self.refreshNewData();
        }
      })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
      var that = this;
      wx.getSystemInfo({
        success: function (res) {
          console.log('windowWidth:' + res.windowWidth);
          screenWidth = res.windowWidth;
          that.setData({
            swiperHeight: (res.windowHeight - 37)
          });
        }
      })
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
      console.log("onPullDownRefresh");
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      console.log("onReachBottom");
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
  
    }
  })