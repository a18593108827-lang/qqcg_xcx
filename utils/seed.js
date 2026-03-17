const storage = require('./storage');

function ensureSeedData() {
  const dishes = storage.getDishes();
  if (!Array.isArray(dishes) || dishes.length === 0) {
    storage.setDishes([
      { id: 1, name: '招牌牛肉面', price: 18.0, category: '主食', picUrl: '' },
      { id: 2, name: '番茄鸡蛋面', price: 15.0, category: '主食', picUrl: '' },
      { id: 3, name: '炸鸡翅（4只）', price: 16.0, category: '小吃', picUrl: '' },
      { id: 4, name: '薯条', price: 10.0, category: '小吃', picUrl: '' },
      { id: 5, name: '可乐', price: 6.0, category: '饮品', picUrl: '' },
      { id: 6, name: '柠檬茶', price: 8.0, category: '饮品', picUrl: '' },
    ]);
  }

  const profile = storage.getProfile();
  if (!profile || !profile.nickname) {
    storage.setProfile({ nickname: '未设置', avatarUrl: '' });
  }
}

module.exports = {
  ensureSeedData,
};

