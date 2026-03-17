const { ensureSeedData } = require('./utils/seed');
const storage = require('./utils/storage');
const { request } = require('./utils/request');

App({
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:8080',
  },

  onLaunch() {
    ensureSeedData();
    this.ensureLogin();
  },

  ensureLogin() {
    let openId = storage.getOpenId();
    if (!openId) {
      openId = `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      storage.setOpenId(openId);
    }

    const profile = storage.getProfile();
    request('/api/auth/login', 'POST', {
      openId,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
    })
      .then((resp) => {
        storage.setUserId(resp.userId || 0);
        storage.setProfile({ nickname: resp.nickname, avatarUrl: resp.avatarUrl });
      })
      .catch(() => {
        // ignore: backend may be offline during dev
      });
  },
});

