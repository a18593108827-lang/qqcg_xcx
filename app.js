const { ensureSeedData } = require('./utils/seed');
const storage = require('./utils/storage');
const { request } = require('./utils/request');

App({
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:8080',
  },

  onLaunch() {
    ensureSeedData();
    this.ensureWxLogin();
  },

  ensureWxLogin() {
    wx.login({
      success: (res) => {
        const code = res && res.code;
        if (!code) return;

        const profile = storage.getProfile();
        request('/api/auth/wxLogin', 'POST', {
          code,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
        })
          .then((resp) => {
            storage.setUserId(resp.userId || 0);
            storage.setOpenId(resp.openId || '');
            storage.setToken(resp.token || '');
            storage.setProfile({ nickname: resp.nickname, avatarUrl: resp.avatarUrl });
          })
          .catch((err) => {
            const msg =
              (err && err.data && err.data.error) ||
              (err && err.errMsg) ||
              '登录失败';
            wx.showModal({ title: '登录失败', content: String(msg), showCancel: false });
          });
      },
      fail: () => {
        wx.showToast({ title: 'wx.login 失败', icon: 'none' });
      },
    });
  },
});

