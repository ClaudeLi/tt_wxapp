import Promise from "../bluebird/js/browser/bluebird.min.js"
module.exports = {
  fetchApi(url, params, method) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${url}`,
        data: Object.assign({}, params),
        method: method,
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        success: resolve,
        fail: reject
      })
    })
  }
}