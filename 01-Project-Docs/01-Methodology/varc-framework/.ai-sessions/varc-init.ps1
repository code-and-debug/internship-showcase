# V.A.R.C. 框架初始化脚本
# 用法: .\varc-init.ps1 -ProjectName "my-project"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [string]$Template = "default",
    [switch]$SkipGit
)

$ErrorActionPreference = "Stop"
$VARCVersion = "1.0.0"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Cyan "🚀 V.A.R.C. Framework v$VARCVersion - 初始化向导"
Write-Output "================================================"

# 1. 创建目录结构
Write-ColorOutput Yellow "📁 创建目录结构..."
$dirs = @(
    ".ai-sessions/active",
    ".ai-sessions/archive",
    ".ai-sessions/chains", 
    ".ai-sessions/recovery",
    ".ai-sessions/templates"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Output "  ✓ 创建 $dir"
    }
}

# 2. 复制模板文件
Write-ColorOutput Yellow "📋 复制模板文件..."
$templates = @{
    "session-snapshot-template.md" = ".ai-sessions/templates/"
    "session-chain-template.json" = ".ai-sessions/templates/"
    "emergency-recovery-template.md" = ".ai-sessions/templates/"
}

# 如果模板文件不存在，则创建
$sessionTemplate = @"
---
session_id: "sess_`$(Get-Date -Format 'yyyyMMdd')_01_`$((New-Guid).ToString().Substring(0,8))"
parent_session: null
context_engine: "Claude-3.5-Sonnet"
context_usage: 
  current: 0%
  limit: 200000
  remaining_tokens: 200000
status: "active"
checkpoint_reason: "会话初始化"
code_hash: "`$(git rev-parse HEAD 2>$null || 'N/A')"
test_status: "PENDING"
verification_command: "npm test"
recovery_priority: "normal"
rollback_target: "git:HEAD"
---

# $ProjectName - 初始会话

## 1. 不可变约束 (Immutable Constraints)
- [ ] **架构约束**: [待填写]
- [ ] **性能约束**: [待填写]
- [ ] **安全约束**: [待填写]
- [ ] **依赖约束**: [待填写]

## 2. 当前状态
### 2.1 代码状态
```diff
# 初始状态
```

### 2.2 思维状态
- **已完成**: 项目初始化
- **进行中**: [待填写]
- **待探索**: [待填写]

### 2.3 阻塞点
无

## 3. 关键决策日志
| 时间 | 决策 | 理由 | 替代方案 | 决策者 |
|------|------|------|----------|--------|

## 4. 资源引用
### 4.1 代码片段
```typescript
// 待填写
```

### 4.2 测试用例
```typescript
// 待填写
```

---
**创建时间**: `$(Get-Date -Format 'yyyy-MM-dd HH:mm')`  
**创建者**: `$(whoami)`  
"@

$sessionPath = ".ai-sessions/active/session-$(Get-Date -Format 'yyyyMMdd')-01-init.md"
$sessionTemplate | Out-File -FilePath $sessionPath -Encoding UTF8
Write-Output "  ✓ 创建初始会话: $sessionPath"

# 3. 创建配置文件
Write-ColorOutput Yellow "⚙️  创建配置文件..."
if (!(Test-Path ".varc-config.yml")) {
    $config = @"
# V.A.R.C. 框架配置
version: "$VARCVersion"

project:
  name: "$ProjectName"
  template: "$Template"
  created_at: "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

checkpoint:
  auto_save:
    enabled: true
    context_threshold: 75%
    time_interval: 30min
  manual_markers:
    - "重大决策点"
    - "方案废弃"
    - "架构变更"

verification:
  required_before_save: []
  snapshot_must_include:
    - "package.json"

audit:
  prompt_db_path: "./prompts"
  require_headers: true
  git_integration:
    auto_commit: false
    commit_template: "[VARC] {session_id} - {summary}"
  chain_maintenance:
    auto_link: true
    archive_after_days: 30

recovery:
  backup:
    enabled: false
    remote: ""
    branch_prefix: "session-"
    push_on_save: false
  continuity:
    context_inheritance: "strict"
    max_chain_depth: 10
    require_explicit_constraints: true

debugging:
  diff_tool: "code --diff"
  log_retention: "10_sessions"
  error_correlation:
    auto_tag_issues: true
"@
    $config | Out-File -FilePath ".varc-config.yml" -Encoding UTF8
    Write-Output "  ✓ 创建 .varc-config.yml"
}

# 4. 创建 .gitignore
Write-ColorOutput Yellow "📝 更新 .gitignore..."
$gitignoreEntry = "
# V.A.R.C. Framework
.ai-sessions/archive/
.ai-sessions/active/*.tmp
.ai-sessions/recovery/*.log
.varc-local.yml
"

if (Test-Path ".gitignore") {
    $content = Get-Content ".gitignore" -Raw
    if ($content -notmatch "V.A.R.C.") {
        Add-Content -Path ".gitignore" -Value $gitignoreEntry
        Write-Output "  ✓ 更新 .gitignore"
    }
} else {
    $gitignoreEntry | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Output "  ✓ 创建 .gitignore"
}

# 5. 初始化 Git 钩子 (可选)
if (!$SkipGit -and (Test-Path ".git")) {
    Write-ColorOutput Yellow "🔧 配置 Git 集成..."
    # 这里可以添加 Git 钩子配置
    Write-Output "  ✓ Git 集成配置完成"
}

# 6. 创建当前会话软链接/指示器
$currentSession = Get-ChildItem ".ai-sessions/active/*.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($currentSession) {
    $currentLink = ".ai-sessions/active/current"
    if (Test-Path $currentLink) {
        Remove-Item $currentLink -Force
    }
    # Windows 使用快捷方式替代软链接
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut("$currentLink.lnk")
    $shortcut.TargetPath = $currentSession.FullName
    $shortcut.Save()
    Write-Output "  ✓ 设置当前会话指针"
}

# 7. 输出完成信息
Write-Output ""
Write-ColorOutput Green "✅ V.A.R.C. 框架初始化完成!"
Write-Output "================================================"
Write-Output ""
Write-Output "项目: $ProjectName"
Write-Output "当前会话: $($currentSession.Name)"
Write-Output ""
Write-ColorOutput Cyan "📖 下一步:"
Write-Output "  1. 编辑 .varc-config.yml 配置验证命令"
Write-Output "  2. 编辑当前会话文件填写不可变约束"
Write-Output "  3. 运行 .\varc-save.ps1 保存会话进度"
Write-Output ""
Write-ColorOutput Cyan "💡 常用命令:"
Write-Output "  .\varc-save.ps1 -Reason '上下文达70%'    # 保存会话"
Write-Output "  .\varc-fork.ps1 -Parent [session-id]      # 分叉新会话"
Write-Output "  .\varc-status.ps1                         # 查看状态"
Write-Output ""
