const storage = require('../../utils/storage');
const KEYS = storage.KEYS;
const { request } = require('../../utils/request');

function computeStats(ordersByDay) {
  const days = Object.keys(ordersByDay || {});
  let orders = 0;
  let totalCount = 0;
  let totalAmount = 0;

  days.forEach((day) => {
    const list = Array.isArray(ordersByDay[day]) ? ordersByDay[day] : [];
    orders += list.length;
    list.forEach((o) => {
      totalCount += Number(o.totalCount || 0);
      totalAmount += Number(o.totalAmount || 0);
    });
  });

  return {
    days: days.length,
    orders,
    totalCount,
    totalAmount: totalAmount.toFixed(2),
  };
}

Page({
  data: {
    defaultAvatar:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="%23f2f3f5"/><circle cx="60" cy="48" r="22" fill="%23c8c9cc"/><rect x="20" y="78" width="80" height="28" rx="14" fill="%23c8c9cc"/></svg>',
    profile: { nickname: '未设置', avatarUrl: '' },
    boundRestaurant: null,
    stats: { days: 0, orders: 0, totalCount: 0, totalAmount: '0.00' },
  },

  onShow() {
    this.reload();
  },

  reload() {
    const profile = storage.getProfile();
    const boundRestaurant = storage.getBoundRestaurant();
    const ordersByDay = storage.getOrdersByDay();
    const stats = computeStats(ordersByDay);
    this.setData({ profile, boundRestaurant, stats });

    // fetch from backend (best-effort)
    const userId = Number(storage.getUserId() || 0);
    if (!userId) return;
    request(`/api/users/me?userId=${userId}`)
      .then((u) => {
        if (!u) return;
        storage.setProfile({ nickname: u.nickname || '未设置', avatarUrl: u.avatarUrl || '' });
        this.setData({ profile: storage.getProfile() });
      })
      .catch(() => {});

    request(`/api/restaurants/current?userId=${userId}`)
      .then((r) => {
        if (r && r.id) {
          storage.setBoundRestaurant(r);
          this.setData({ boundRestaurant: r });
        }
      })
      .catch(() => {});
  },

  goBind() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onGetWxProfile() {
    if (!wx.getUserProfile) {
      wx.showToast({ title: '当前基础库不支持', icon: 'none' });
      return;
    }
    wx.getUserProfile({
      desc: '用于展示头像昵称',
      success: (res) => {
        const u = res.userInfo || {};
        storage.setProfile({
          nickname: u.nickName || this.data.profile.nickname,
          avatarUrl: u.avatarUrl || this.data.profile.avatarUrl,
        });
        this.reload();
        wx.showToast({ title: '已更新', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '未授权', icon: 'none' });
      },
    });
  },

  onUnbind() {
    if (!this.data.boundRestaurant) return;
    wx.showModal({
      title: '解绑餐馆',
      content: '解绑后需要重新绑定才能点餐。',
      confirmText: '解绑',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (!res.confirm) return;
        storage.clearBoundRestaurant();
        this.reload();
        wx.showToast({ title: '已解绑', icon: 'success' });
      },
    });
  },

  onClearHistory() {
    wx.showModal({
      title: '清空记录',
      content: '将清空本地所有点餐记录与今日选择，是否继续？',
      confirmText: '清空',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (!res.confirm) return;
        storage.remove(KEYS.ORDERS_BY_DAY);
        storage.clearCartToday();
        this.reload();
        wx.showToast({ title: '已清空', icon: 'success' });
      },
    });
  },
});