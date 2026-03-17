const storage = require('../../utils/storage');
const { todayYMD } = require('../../utils/date');

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
    const ordersByDay = storage.getOrdersByDay();
    const dayTabs = buildViewModel(ordersByDay);

    // 默认选中：今天（如果有），否则选最新一天
    let activeTab = 0;
    const today = todayYMD();
    const idxToday = dayTabs.findIndex((t) => t.day === today);
    if (idxToday >= 0) activeTab = idxToday;

    this.setData({ dayTabs, activeTab });
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.index });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});