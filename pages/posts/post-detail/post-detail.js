var postsData = require('../../../data/posts-data.js');
var app = getApp();
Page({
  data:{
    isPlayingMusic:false
  },
  onLoad: function (option) {
    var postId = option.id;
    this.setData({
      currentPostId: postId
    });
    var postData = postsData.postList[postId];
    this.setData({
      postData: postData
    })

    var postsCollected = wx.getStorageSync('posts_collected')
    if (postsCollected) {
      if (postsCollected[postId]){
        var postCollected = postsCollected[postId]
        this.setData({
          collected: postCollected
        })
      }
      else{
        postsCollected[postId] = false;
        wx.setStorageSync('posts_collected', postsCollected);
      }
    }
    else {
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_collected', postsCollected);
    }

    if(app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId === postId){
      this.setData({
        isPlayingMusic:true
      });
    }
    this.setMusicMonitor();
  },
  setMusicMonitor:function(event){
    var that = this;
    wx.onBackgroundAudioPlay(function(event){
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];//?为什么减一
      if(currentPage.data.currentPostId === that.data.currentPostId){
        if(app.globalData.g_currentMusicPostId == that.data.currentPostId){
          that.setData({
            isPlayingMusic:true
          })
        }
      }
      app.globalData.g_isPlayingMusic = true;
    });
    wx.onBackgroundAudioPause(function(){
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];
      if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
        that.setData({
          isPlayingMusic: false
        })
      }
      app.globalData.g_isPlayingMusic = false;
    });
    wx.onBackgroundAudioStop(function () {
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
    });
  },
  onColletionTap: function (event) {
    var postsCollected = wx.getStorageSync('posts_collected');
    var postCollected = postsCollected[this.data.currentPostId];
    // 收藏变成未收藏，未收藏变成收藏
    postCollected = !postCollected;
    postsCollected[this.data.currentPostId] = postCollected;
    wx.setStorageSync('posts_collected', postsCollected);
    this.setData({
      collected: postCollected
    })

    wx.showToast({
      title: postCollected ? '收藏成功' : '取消收藏'
    })
  },
  onShareTap: function (event) {
    var itemList = [
      "分享给微信好友",
      "分享到朋友圈",
      "分享到QQ",
      "分享到微博"
    ];
    wx.showActionSheet({
      itemList: itemList,
      itemColor: "#405f80",
      success: function (res) {
        // res.cancel 用户是不是点击了取消按钮
        // res.tapIndex 数组元素的序号，从0开始
        wx.showModal({
          title: "用户 " + itemList[res.tapIndex],
          content: "用户是否取消？" + res.cancel + "现在无法实现分享功能，什么时候能支持呢"
        })
      }
    })
  },
  onMusicTap:function(event){
    var currentPostId = this.data.currentPostId;
    var postData = postsData.postList[currentPostId];
    var isPlayingMusic = this.data.isPlayingMusic;
    if(isPlayingMusic){
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic:false
      })
      app.globalData.g_isPlayingMusic = false;
    }
    else{
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title:postData.music.title,
        coverImgUrl:postData.music.coverImg
      });
      this.setData({
        isPlayingMusic:true
      });
      app.globalData.g_currentMusicPostId = this.data.currentPostId;
      app.globalData.g_isPlayingMusic = true;
    }
  }
})