# V.A.R.C. 优化速查卡

> 快速查看当前可做的优化

---

## 🎯 本周必做 (P0)

| 优化 | 命令 | 难度 | 预计时间 |
|-----|------|------|---------|
| **真正的上下文检测** | 见下方详细步骤 | 中 | 4h |
| **智能会话摘要** | 修改 `varc-quick-save.ps1` | 低 | 2h |
| **--dry-run 参数** | 所有脚本添加参数 | 低 | 1h |
| **搜索历史会话** | 创建 `varc-search.ps1` | 低 | 2h |

### 快速实施：真正的上下文检测

```powershell
# 1. 创建浏览器扩展（Claude 为例）
# manifest.json
{
  "name": "VARC Context Detector",
  "version": "1.0",
  "permissions": ["activeTab", "storage"],
  "content_scripts": [{
    "matches": ["https://claude.ai/*"],
    "js": ["content.js"]
  }]
}

# content.js - 提取真实上下文使用率
function getContextUsage() {
  // 从页面 DOM 或 API 获取
  const usage = {
    percentage: parseInt(document.querySelector('[data-testid="context-usage"]').textContent),
    tokens: parseInt(document.querySelector('[data-testid="token-count"]').textContent)
  };
  
  // 发送到本地服务器
  fetch('http://localhost:3456/context', {
    method: 'POST',
    body: JSON.stringify(usage)
  });
}

# 2. 创建本地服务器接收数据
# Start-ContextServer.ps1
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3456/")
$listener.Start()

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $usage = $context.Request.InputStream | ConvertFrom-Json
    $usage | Export-Clixml ".varc/context-usage.xml"
    $context.Response.Close()
}

# 3. 修改 varc-quick-save.ps1 使用真实数据
function Get-ContextUsage {
    if (Test-Path ".varc/context-usage.xml") {
        return Import-Clixml ".varc/context-usage.xml"
    }
    # 回退到估算
    return Get-EstimatedContextUsage
}
```

---

## ⚡ 2周内完成 (P1)

| 优化 | 收益 | 关键文件 |
|-----|------|---------|
| **约束自动检测** | ⭐⭐⭐⭐ | `varc-guard.ps1` |
| **一键恢复** | ⭐⭐⭐⭐⭐ | `varc-restore.ps1` |
| **会话相似度** | ⭐⭐⭐ | `varc-quick-save.ps1` |
| **Webhook** | ⭐⭐⭐ | `varc-webhook.ps1` |

### 快速实施：约束自动检测

```powershell
# varc-guard.ps1 - 最小可行版本
$constraints = @(
    @{
        Name = "no-console"
        Pattern = "console\.(log|warn|error)"
        Message = "生产代码不应包含 console 语句"
        Severity = "warning"
    }
)

foreach ($c in $constraints) {
    $matches = Select-String -Path "src/**/*.ts" -Pattern $c.Pattern
    if ($matches) {
        Write-Host "⚠️  $($c.Name): $($matches.Count) 处" -ForegroundColor Yellow
        $matches | ForEach-Object { Write-Host "   $($_.Path):$($_.LineNumber)" }
    }
}
```

---

## 📈 1个月内 (P2)

| 优化 | 前提条件 | 复杂度 |
|-----|---------|-------|
| **渐进式模板** | 统计用户会话数 | 低 |
| **知识库RAG** | Python 环境 | 高 |
| **预测性分叉** | 有历史数据 | 中 |
| **可视化** | Node.js 环境 | 中 |

### 快速实施：渐进式模板

```powershell
# 在 varc-init-v2.ps1 中添加
$sessionCount = (Get-ChildItem ".ai-sessions" -Recurse -Filter "*.md").Count

$template = switch ($sessionCount) {
    { $_ -lt 5 } { "templates/session-v2-beginner.md" }
    { $_ -lt 20 } { "templates/session-v2-intermediate.md" }
    default { "templates/session-v2-expert.md" }
}
```

---

## 🚀 快速命令参考

```powershell
# 立即实施 P0-4：搜索历史会话
function varc-search($keyword) {
    Get-ChildItem ".ai-sessions" -Recurse -Filter "*.md" | 
        Select-String -Pattern $keyword |
        Select-Object Filename, LineNumber, Line -First 10
}

# 立即实施 P0-3：dry-run 模式
function varc-save-preview() {
    .\scripts\varc-quick-save.ps1 -DryRun
}

# 立即实施 P1-5：约束检查
function varc-guard() {
    .\scripts\varc-guard.ps1
}
```

---

## 📋 优化决策树

```
遇到什么问题？
│
├─ 经常忘记保存？
│  └─> 实施 P0-1: 真正的上下文检测
│
├─ 填写模板麻烦？
│  └─> 实施 P0-2: 智能摘要
│
├─ 担心保存错？
│  └─> 实施 P0-3: --dry-run
│
├─ 找不到历史会话？
│  └─> 实施 P0-4: varc-search
│
├─ 约束经常被违反？
│  └─> 实施 P1-5: 约束检测
│
├─ 复制粘贴麻烦？
│  └─> 实施 P1-6: 一键恢复
│
└─ 重复踩坑？
   └─> 实施 P1-7: 相似度检测
       └─> 长期: P2-10 知识库RAG
```

---

## 🎓 实施顺序建议

### 最小可行优化（本周）
1. `--dry-run` 参数（1小时）
2. `varc-search.ps1`（2小时）
3. 智能会话摘要（2小时）

### 效果最大化（2周内）
1. 约束自动检测（4小时）
2. Webhook 通知（2小时）
3. 会话相似度检测（3小时）

### 长期价值（1个月内）
1. 真正的上下文检测（需要浏览器扩展）
2. 知识库RAG（需要Python环境）
3. 一键恢复（需要自动化工具）

---

## ✅ 今日可做（5分钟）

- [ ] 创建 `varc-search.ps1` 搜索脚本
- [ ] 给 `varc-quick-save.ps1` 添加 `--dry-run` 参数
- [ ] 创建 `varc-guard.ps1` 约束检查（最小版本）

---

**打印此页，贴在工作区随时参考**
