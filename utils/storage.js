const KEYS = require('./keys');
const { todayYMD } = require('./date');

function get(key, defaultValue) {
  try {
    const v = wx.getStorageSync(key);
    return v === '' || v === undefined ? defaultValue : v;
  } catch (e) {
    return defaultValue;
  }
}

function set(key, value) {
  wx.setStorageSync(key, value);
}

function remove(key) {
  wx.removeStorageSync(key);
}

function getProfile() {
  return get(KEYS.PROFILE, {
    nickname: '未设置',
    avatarUrl: '',
  });
}

function setProfile(p) {
  const cur = getProfile();
  set(KEYS.PROFILE, { ...cur, ...p });
}

function getBoundRestaurant() {
  return get(KEYS.BOUND_RESTAURANT, null);
}

function setBoundRestaurant(r) {
  set(KEYS.BOUND_RESTAURANT, r);
}

function clearBoundRestaurant() {
  remove(KEYS.BOUND_RESTAURANT);
}

function getDishes() {
  return get(KEYS.DISHES, []);
}

function setDishes(list) {
  set(KEYS.DISHES, list);
}

function getCartToday() {
  return get(KEYS.CART_TODAY, {});
}

function setCartToday(cartMap) {
  set(KEYS.CART_TODAY, cartMap);
}

function clearCartToday() {
  remove(KEYS.CART_TODAY);
}

function getOrdersByDay() {
  return get(KEYS.ORDERS_BY_DAY, {});
}

function addOrderForToday(order) {
  const day = todayYMD();
  const all = getOrdersByDay();
  const list = Array.isArray(all[day]) ? all[day] : [];
  all[day] = [order, ...list];
  set(KEYS.ORDERS_BY_DAY, all);
}

module.exports = {
  KEYS,
  get,
  set,
  remove,
  getProfile,
  setProfile,
  getOpenId: () => get(KEYS.OPEN_ID, ''),
  setOpenId: (v) => set(KEYS.OPEN_ID, v),
  getUserId: () => get(KEYS.USER_ID, 0),
  setUserId: (v) => set(KEYS.USER_ID, v),
  getBoundRestaurant,
  setBoundRestaurant,
  clearBoundRestaurant,
  getDishes,
  setDishes,
  getCartToday,
  setCartToday,
  clearCartToday,
  getOrdersByDay,
  addOrderForToday,
};

