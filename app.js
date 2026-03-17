const { ensureSeedData } = require('./utils/seed');

App({
  globalData: {
    apiBaseUrl: 'http://localhost:8080',
  },

  onLaunch() {
    ensureSeedData();
  },
});

