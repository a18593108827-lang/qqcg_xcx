const storage = require('./storage');

function ensureSeedData() {
  const profile = storage.getProfile();
  if (!profile || !profile.nickname) {
    storage.setProfile({ nickname: '未设置', avatarUrl: '' });
  }
}

module.exports = {
  ensureSeedData,
};

