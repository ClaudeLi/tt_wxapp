import {
  TT_URL,
  TT_Home_ID
} from "./constant.js"
var net = require("./netLoad.js");

function getHomeTitle() {
  let url = TT_URL + "/v5/index/get_channel"
  let params = {}
  return net.fetchApi(url, params, "POST").then(data => data)
}
function loadHomeList(page, id) {
  let url = TT_URL;
  if (id == TT_Home_ID){
    url = url + "/v5/index/get_school_ranking"
  }else{
    url = url + "/v5/index/get_child_channel_school"
  }
  let params = { "page": page, 'type_id':id}
  return net.fetchApi(url, params, "POST").then(data => data)
}

function loadDetailData(id){
  let url = TT_URL + "/school/details"
  let params = { "id": id}
  return net.fetchApi(url, params, "POST").then(data => data)
}

function getSchoolCommentData(id, page) {
  let url = TT_URL + "/school/get_comment_insert_like"
  let params = { "id": id, "page": page}
  return net.fetchApi(url, params, "POST").then(data => data)
}

function formatCountToSring(n) {
  var count = parseInt(n);
  if (count > 10000) {
    return (n / 10000.0).toFixed(1) + '万';
  } else if (count > 100000000) {
    return (n / 100000000.0).toFixed(1) + '亿';
  } else {
    return n;
  }
}

export {
  getHomeTitle,
  loadHomeList,
  loadDetailData,
  getSchoolCommentData,
  formatCountToSring,
} 