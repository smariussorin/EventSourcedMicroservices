## 2024-05-24 - Hardcoded Redis Password
**Vulnerability:** Found hardcoded Redis password (`ztEB@DSWP^3P5Zt`) in `msgbus.js`, `config/eventDenormalizer-config.js`, `microservice-saga-category/server.js`, and `microservice-saga-product/server.js`.
**Learning:** Hardcoded credentials are often used for quick local development but represent a critical security risk if committed to version control, allowing attackers full access to the database or caching system.
**Prevention:** Use environment variables (e.g., `process.env.REDIS_PASSWORD`) to provide secrets to the application at runtime.
