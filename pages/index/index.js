const storage = require('../../utils/storage');
const { todayYMD } = require('../../utils/date');
const { request } = require('../../utils/request');

function calcTotals(dishes, cartMap) {
  let totalCount = 0;
  let totalAmount = 0;
  const priceMap = new Map(dishes.map((d) => [String(d.id), Number(d.price)]));

  Object.keys(cartMap || {}).forEach((k) => {
    const qty = Number(cartMap[k] || 0);
    if (qty > 0) {
      totalCount += qty;
      totalAmount += qty * (priceMap.get(String(k)) || 0);
    }
  });

  return {
    totalCount,
    totalAmount: totalAmount.toFixed(2),
  };
}

Page({
  data: {
    today: todayYMD(),
    userId: 0,
    boundRestaurant: null,
    dishes: [],
    filteredDishes: [],
    keyword: '',
    cart: {},
    totalCount: 0,
    totalAmount: '0.00',
  },

  onShow() {
    this.reloadAll();
  },

  reloadAll() {
    const userId = Number(storage.getUserId() || 0);
    const boundRestaurant = storage.getBoundRestaurant();
    const dishes = storage.getDishes();
    const cart = storage.getCartToday();

    const filteredDishes = this.filterDishes(dishes, this.data.keyword);
    const totals = calcTotals(dishes, cart);

    this.setData({
      today: todayYMD(),
      userId,
      boundRestaurant,
      dishes,
      filteredDishes,
      cart,
      totalCount: totals.totalCount,
      totalAmount: totals.totalAmount,
    });

    // fetch from backend (best-effort)
    if (userId) {
      request(`/api/restaurants/current?userId=${userId}`)
        .then((r) => {
          if (r && r.id) {
            storage.setBoundRestaurant(r);
            this.setData({ boundRestaurant: r });
            return request(`/api/dishes?restaurantId=${r.id}`);
          }
          return null;
        })
        .then((ds) => {
          if (Array.isArray(ds)) {
            storage.setDishes(ds);
            const filtered = this.filterDishes(ds, this.data.keyword);
            const totals2 = calcTotals(ds, this.data.cart);
            this.setData({
              dishes: ds,
              filteredDishes: filtered,
              totalCount: totals2.totalCount,
              totalAmount: totals2.totalAmount,
            });
          }
        })
        .catch(() => {});
    }
  },

  filterDishes(dishes, keyword) {
    const kw = String(keyword || '').trim().toLowerCase();
    if (!kw) return dishes;
    return dishes.filter((d) => {
      const name = String(d.name || '').toLowerCase();
      const cat = String(d.category || '').toLowerCase();
      return name.includes(kw) || cat.includes(kw);
    });
  },

  onSearchChange(e) {
    const keyword = e.detail;
    const filteredDishes = this.filterDishes(this.data.dishes, keyword);
    this.setData({ keyword, filteredDishes });
  },

  onSearchClear() {
    const filteredDishes = this.filterDishes(this.data.dishes, '');
    this.setData({ keyword: '', filteredDishes });
  },

  onBindOrCreateTap() {
    const userId = Number(storage.getUserId() || 0);
    if (!userId) {
      wx.showToast({ title: '后端未连接', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '创建并绑定餐馆',
      content: '先创建一个简单示例餐馆（后续再做真实表单）。',
      confirmText: '创建',
      success: (res) => {
        if (!res.confirm) return;
        request('/api/restaurants/bindOrCreate', 'POST', {
          userId,
          name: '我们的小餐馆',
          address: '',
        })
          .then((r) => {
            storage.setBoundRestaurant(r);
            this.setData({ boundRestaurant: r });
            return request(`/api/dishes?restaurantId=${r.id}`);
          })
          .then((ds) => {
            if (Array.isArray(ds)) {
              storage.setDishes(ds);
              this.setData({
                dishes: ds,
                filteredDishes: this.filterDishes(ds, this.data.keyword),
              });
            }
            wx.showToast({ title: '已绑定', icon: 'success' });
          })
          .catch(() => wx.showToast({ title: '绑定失败', icon: 'none' }));
      },
    });
  },

  onInc(e) {
    if (!this.data.boundRestaurant) {
      wx.showToast({ title: '请先绑定餐馆', icon: 'none' });
      return;
    }
    const id = String(e.currentTarget.dataset.id);
    const cart = { ...(this.data.cart || {}) };
    cart[id] = Number(cart[id] || 0) + 1;
    storage.setCartToday(cart);

    const totals = calcTotals(this.data.dishes, cart);
    this.setData({ cart, totalCount: totals.totalCount, totalAmount: totals.totalAmount });
  },

  onDec(e) {
    if (!this.data.boundRestaurant) {
      wx.showToast({ title: '请先绑定餐馆', icon: 'none' });
      return;
    }
    const id = String(e.currentTarget.dataset.id);
    const cart = { ...(this.data.cart || {}) };
    const next = Number(cart[id] || 0) - 1;
    if (next <= 0) {
      delete cart[id];
    } else {
      cart[id] = next;
    }
    storage.setCartToday(cart);

    const totals = calcTotals(this.data.dishes, cart);
    this.setData({ cart, totalCount: totals.totalCount, totalAmount: totals.totalAmount });
  },

  onSubmitToday() {
    if (!this.data.boundRestaurant) return;
    if (this.data.totalCount === 0) return;

    const dishesById = new Map(this.data.dishes.map((d) => [String(d.id), d]));
    const items = Object.keys(this.data.cart).map((id) => ({
      dishId: Number(id),
      quantity: Number(this.data.cart[id] || 0),
    }));

    const userId = Number(storage.getUserId() || 0);
    if (!userId) {
      wx.showToast({ title: '后端未连接', icon: 'none' });
      return;
    }

    request('/api/orders/submit', 'POST', {
      userId,
      restaurantId: this.data.boundRestaurant.id,
      items,
    })
      .then(() => {
        storage.clearCartToday();
        this.reloadAll();
        wx.showToast({ title: '已下单', icon: 'success' });
        wx.switchTab({ url: '/pages/cart/cart' });
      })
      .catch(() => wx.showToast({ title: '下单失败', icon: 'none' }));
  },
});