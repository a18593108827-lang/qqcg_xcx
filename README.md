# qqcg_xcx

情侣点餐小助手（微信小程序 + Spring Boot 3 + MySQL）。

本仓库包含：
- 小程序前端：项目根目录
- 后端：`server/`（Spring Boot 3, Java 17, Maven）

> 说明：当前为“开发态串联版本”，小程序用本地生成的 `openId` 作为开发登录标识，后端返回 `userId`，前端后续请求都携带 `userId`。

## 1. 环境准备

- **Node.js**：用于安装 `@vant/weapp`
- **微信开发者工具**：用于运行小程序
- **Java**：JDK 17+
- **Maven**：3.8+
- **MySQL**：8+

## 2. 数据库初始化（MySQL）

数据库名：`qqcg_xcx`

如果你还没建库建表，可执行（账号密码按你本机为准）：

```sql
CREATE DATABASE IF NOT EXISTS qqcg_xcx DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE qqcg_xcx;

CREATE TABLE IF NOT EXISTS user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(64),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  address VARCHAR(255),
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_restaurant_bind (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  restaurant_id BIGINT NOT NULL,
  bound_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_rest (user_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS dish (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id BIGINT NOT NULL,
  name VARCHAR(64) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  pic_url VARCHAR(255),
  category VARCHAR(32),
  online TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  restaurant_id BIGINT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  total_count INT NOT NULL,
  status TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  dish_id BIGINT NOT NULL,
  dish_name VARCHAR(64) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  quantity INT NOT NULL
);
```

## 3. 启动后端（Spring Boot 3）

后端目录：`server/`

### 3.1 配置数据库密码

后端配置使用环境变量（避免把密码提交到仓库）：

- `DB_URL`（可选）：默认 `jdbc:mysql://127.0.0.1:3306/qqcg_xcx?...`
- `DB_USERNAME`（可选）：默认 `root`
- **`DB_PASSWORD`（必填）**：你的数据库密码

PowerShell 示例（你的本机密码如果是 `123456`）：

```powershell
cd d:\Java\sursor\dcxcx\server
$env:DB_PASSWORD="123456"
mvn spring-boot:run
```

### 3.2 验证后端是否正常

健康检查：

- `GET http://127.0.0.1:8080/api/health`
- 期望返回：`{"ok":true}`

## 4. 运行小程序前端

### 4.1 安装依赖

在仓库根目录：

```powershell
npm i
```

### 4.2 构建 Vant（重要）

在微信开发者工具里执行：

- **工具 → 构建 npm**

### 4.3 运行

用微信开发者工具打开本项目根目录并编译运行。

### 4.4 后端地址配置

小程序请求基地址在 `app.js`：

- `apiBaseUrl: 'http://127.0.0.1:8080'`

如需改端口/域名，改这里即可。

> 注意：真机调试时 `127.0.0.1` 指向手机本机，需改为你电脑的局域网 IP，并在开发者工具/小程序后台配置合法域名（上线需 https）。

## 5. 功能说明（前后端串联）

### 5.1 小程序页面

- `pages/index/index`：创建/绑定餐馆、从后端拉菜品、选择数量并下单
- `pages/cart/cart`：从后端按天获取订单并展示
- `pages/mine/mine`：从后端获取用户信息/当前绑定餐馆/统计

### 5.2 后端接口（核心）

- **Auth**
  - `POST /api/auth/login`：开发态登录（入参：`openId/nickname/avatarUrl`）
- **Restaurant**
  - `GET /api/restaurants/current?userId=...`
  - `POST /api/restaurants/bindOrCreate`
- **Dish**
  - `GET /api/dishes?restaurantId=...`：若餐馆首次无菜品，会自动 seed 6 个默认菜
- **Order**
  - `POST /api/orders/submit`
  - `GET /api/orders/by-day?userId=...&restaurantId=...`
- **User**
  - `GET /api/users/me?userId=...`

## 6. 常见问题

### 6.1 启动后端报 “Access denied (using password: NO)”

说明未传 `DB_PASSWORD`。按上面方式设置环境变量再启动即可。

### 6.2 小程序 Vant 组件找不到

在微信开发者工具执行一次 **工具 → 构建 npm**，并确保项目里存在 `miniprogram_npm/`。

- `pages/index/index`：绑定餐馆、浏览菜品、点餐并加入今日记录
- `pages/cart/cart`：按天查看点餐记录
- `pages/mine/mine`：个人信息、绑定餐馆与统计

