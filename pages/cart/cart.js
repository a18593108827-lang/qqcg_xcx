const storage = require('../../utils/storage');
const { todayYMD } = require('../../utils/date');
const { request } = require('../../utils/request');

function formatTime(ts) {
  const d = new Date(Number(ts));
  if (Number.isNaN(d.getTime())) return '';
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

function computeDayStat(orders) {
  const list = Array.isArray(orders) ? orders : [];
  let totalCount = 0;
  let totalAmount = 0;
  list.forEach((o) => {
    totalCount += Number(o.totalCount || 0);
    totalAmount += Number(o.totalAmount || 0);
  });
  return {
    orderCount: list.length,
    totalCount,
    totalAmount: totalAmount.toFixed(2),
  };
}

function buildViewModel(ordersByDay) {
  const days = Object.keys(ordersByDay || {}).sort((a, b) => (a < b ? 1 : -1));
  return days.map((day) => {
    const orders = Array.isArray(ordersByDay[day]) ? ordersByDay[day] : [];
    const vmOrders = orders.map((o) => ({
      ...o,
      createdAtText: formatTime(o.createdAt),
      items: (o.items || []).map((it) => ({
        ...it,
        lineTotal: (Number(it.price || 0) * Number(it.quantity || 0)).toFixed(2),
      })),
    }));
    const title = day === todayYMD() ? '今天' : day.slice(5);
    return {
      day,
      title,
      orders: vmOrders,
      stat: computeDayStat(vmOrders),
    };
  });
}

Page({
  data: {
    dayTabs: [],
    activeTab: 0,
  },

  onShow() {
    this.reload();
  },

  reload() {
    const token = storage.getToken && storage.getToken();
    const bound = storage.getBoundRestaurant();
    if (!token) {
      this.setData({ dayTabs: [], activeTab: 0 });
      return;
    }
    const qs = bound && bound.id ? `restaurantId=${bound.id}` : '';
    request(`/api/orders/by-day${qs ? `?${qs}` : ''}`)
      .then((resp) => {
        const days = (resp && resp.days) || {};
        const local = {};
        Object.keys(days).forEach((day) => {
          local[day] = (days[day] || []).map((o) => ({
            id: o.id,
            restaurantId: o.restaurantId,
            restaurantName: o.restaurantName,
            createdAt: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
            items: (o.items || []).map((it) => ({
              dishId: it.dishId,
              name: it.name,
              price: Number(it.price),
              quantity: Number(it.quantity),
            })),
            totalAmount: Number(o.totalAmount),
            totalCount: Number(o.totalCount),
          }));
        });
        const tabs2 = buildViewModel(local);
        const today = todayYMD();
        const idx = tabs2.findIndex((t) => t.day === today);
        this.setData({ dayTabs: tabs2, activeTab: idx >= 0 ? idx : 0 });
      })
      .catch(() => wx.showToast({ title: '后端未启动', icon: 'none' }));
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.index });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});