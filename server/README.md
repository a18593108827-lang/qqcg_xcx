# qqcg-server

Spring Boot 3 后端（Java 17 + Maven + JPA + MySQL）。

## 启动

```powershell
cd d:\Java\sursor\dcxcx\server
$env:DB_PASSWORD="123456"
mvn spring-boot:run
```

健康检查：

- `GET http://127.0.0.1:8080/api/health`

## 配置项

后端通过环境变量读取数据库配置（见 `src/main/resources/application.yml`）：

- `DB_URL`（可选）
- `DB_USERNAME`（可选）
- `DB_PASSWORD`（必填）

