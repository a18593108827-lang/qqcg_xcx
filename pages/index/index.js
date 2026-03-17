const storage = require('../../utils/storage');
const { todayYMD } = require('../../utils/date');

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
    const boundRestaurant = storage.getBoundRestaurant();
    const dishes = storage.getDishes();
    const cart = storage.getCartToday();

    const filteredDishes = this.filterDishes(dishes, this.data.keyword);
    const totals = calcTotals(dishes, cart);

    this.setData({
      today: todayYMD(),
      boundRestaurant,
      dishes,
      filteredDishes,
      cart,
      totalCount: totals.totalCount,
      totalAmount: totals.totalAmount,
    });
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
    const cur = storage.getBoundRestaurant();
    const defaultName = cur ? cur.name : '我们的小餐馆';
    const defaultAddress = cur ? cur.address : '';

    wx.showModal({
      title: '绑定餐馆',
      content:
        '小程序端先做最小版：点击确定后将绑定一个示例餐馆（可多次切换）。后端完成后这里会改成创建/选择餐馆。',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (!res.confirm) return;
        storage.setBoundRestaurant({
          id: 1,
          name: defaultName,
          address: defaultAddress,
        });
        this.reloadAll();
        wx.showToast({ title: '已绑定', icon: 'success' });
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
    const items = Object.keys(this.data.cart).map((id) => {
      const dish = dishesById.get(String(id));
      const quantity = Number(this.data.cart[id] || 0);
      return {
        dishId: Number(id),
        name: dish ? dish.name : `菜品${id}`,
        price: dish ? Number(dish.price) : 0,
        quantity,
      };
    });

    const order = {
      id: `local_${Date.now()}`,
      restaurantId: this.data.boundRestaurant.id,
      restaurantName: this.data.boundRestaurant.name,
      day: todayYMD(),
      createdAt: Date.now(),
      items,
      totalAmount: Number(this.data.totalAmount),
      totalCount: this.data.totalCount,
    };

    storage.addOrderForToday(order);
    storage.clearCartToday();
    this.reloadAll();

    wx.showToast({ title: '已加入记录', icon: 'success' });
    wx.switchTab({ url: '/pages/cart/cart' });
  },
});