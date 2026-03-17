function getApiBaseUrl() {
  const app = getApp();
  const base = app && app.globalData && app.globalData.apiBaseUrl;
  return base || 'http://127.0.0.1:8080';
}

function request(path, method = 'GET', data = {}, header = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header,
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

module.exports = {
  request,
};

