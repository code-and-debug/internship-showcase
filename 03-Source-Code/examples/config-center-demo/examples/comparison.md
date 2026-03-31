# 重构前后对比

## 代码对比

### 重构前：proConfig.ts（约 1280 行硬编码）

```typescript
// proConfig.ts
export const miniProgramConfig = {
  '1001033': {
    wxAppid: 'wxe26143481567cb97',
    alipayAppid: '2021002139602458',
    name: '台州市第一人民医院',
    isStartComeTest: false,  // 通过注释切换环境
    // isStartComeTest: true,
    sConfig: {
      // apiBaseUrl: 'https://dev-api.eheren.com',  // 开发环境
      // apiBaseUrl: 'https://test-api.eheren.com', // 测试环境
      apiBaseUrl: 'https://api.eheren.com',        // 生产环境
    }
  },
  // ... 50+ 医院配置
};

export const manifestFileDataObj = {
  'mp-weixin': { appid: 'wxe26143481567cb97' },
  'mp-alipay': { appid: '2021002139602458' },
  'mp-harmony': {
    distribute: {
      signingConfigs: {
        default: {
          keyPassword: '0000001D077DADAA60B9CFFDE7D388BB...', // 硬编码密钥！
        }
      }
    }
  }
};
```

### 重构后：Config Center 分层配置

```typescript
// 基础配置（稳定不变）
// config/tenants/1001033.json
{
  "sysCode": "1001033",
  "name": "台州市第一人民医院",
  "wxAppid": "wxe26143481567cb97",
  "alipayAppid": "2021002139602458",
  "sConfig": { /* 业务功能开关 */ }
}

// 开发环境覆盖
// config/environments/dev/1001033.json
{
  "_meta": { "env": "dev", "version": "1.0.0-dev" },
  "overrides": {
    "wxAppid": "wx_demo_dev_1001033",
    "sConfig": { "apiBaseUrl": "https://dev-api.eheren.com" }
  }
}

// 生产环境（敏感信息使用占位符）
// config/environments/prod/1001033.json
{
  "_meta": { "env": "prod", "version": "1.0.0" },
  "secrets": {
    "keyPassword": "${HARMONY_KEY_PASSWORD}"
  }
}
```

### 业务代码接入（无需修改）

```typescript
// 原有代码完全兼容
import { miniProgramConfig } from './proConfig.adapter';

// 旧的用法仍然有效
const config = miniProgramConfig['1001033'];

// 新的用法（更灵活）
import { configCenter } from './src/config';
const devConfig = configCenter.getConfig('1001033', 'dev');
const prodConfig = configCenter.getConfig('1001033', 'prod');
```

## 关键改进

| 方面 | 重构前 | 重构后 |
|------|--------|--------|
| **配置变更** | 修改代码 -> 提交 -> 发版 -> 审核（2天+） | 修改 JSON -> 提交 -> 自动生效（5分钟） |
| **环境切换** | 改代码注释，容易出错 | 切换环境变量 NODE_ENV=dev/test/prod |
| **敏感信息** | 硬编码在源码，安全风险 | 分离到环境配置，CI/CD 注入 |
| **新增医院** | 修改 proConfig.ts，易冲突 | 新增 JSON 文件，零冲突 |
| **配置校验** | 运行时崩溃 | CLI 工具提前拦截 |
| **版本管理** | Git 文件历史 | 语义化版本 + 自动备份 |
| **配置回滚** | 发版回退 | 版本快照一键恢复 |
