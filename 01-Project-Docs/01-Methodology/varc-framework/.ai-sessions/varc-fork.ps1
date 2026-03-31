# V.A.R.C. 框架 - 会话分叉脚本
# 用法: .\varc-fork.ps1 -Parent [session-id] -Reason "上下文耗尽"

param(
    [Parameter(Mandatory=$true)]
    [string]$Parent,
    
    [Parameter(Mandatory=$true)]
    [string]$Reason,
    
    [string]$ChainId = ""
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Cyan "🌿 分叉新会话"
Write-Output "================================================"

# 1. 查找父会话
$parentSession = $null
$searchPaths = @(
    ".ai-sessions/active/$Parent.md",
    ".ai-sessions/active/$Parent",
    ".ai-sessions/archive/*/$Parent.md",
    ".ai-sessions/archive/*/$Parent"
)

foreach ($path in $searchPaths) {
    $found = Get-Item $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $parentSession = $found
        break
    }
}

if (!$parentSession) {
    Write-ColorOutput Red "❌ 找不到父会话: $Parent"
    exit 1
}

Write-Output "父会话: $($parentSession.Name)"

# 2. 生成新会话 ID
$existing = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | Sort-Object Name
$nextNum = 1
if ($existing) {
    $today = Get-Date -Format 'yyyyMMdd'
    $todaySessions = $existing | Where-Object { $_.Name -match "session-$today" }
    if ($todaySessions) {
        $nums = $todaySessions | ForEach-Object {
            if ($_.Name -match 'session-\d{8}-(\d{2})') { [int]$matches[1] }
        } | Sort-Object
        $nextNum = $nums[-1] + 1
    }
}

$sessionId = "sess_$(Get-Date -Format 'yyyyMMdd')_$($nextNum.ToString('D2'))_$((New-Guid).ToString().Substring(0,8))"
$newSessionPath = ".ai-sessions/active/session-$(Get-Date -Format 'yyyyMMdd')-$($nextNum.ToString('D2'))-$($sessionId.Split('_')[3]).md"

Write-Output "新会话: $([System.IO.Path]::GetFileName($newSessionPath))"

# 3. 读取父会话内容
$parentContent = Get-Content $parentSession.FullName -Raw

# 4. 生成新会话内容
$newContent = @"
---
# === 元数据区块 (Machine Readable) ===
session_id: "$sessionId"
parent_session: "$Parent"
context_engine: "Claude-3.5-Sonnet"
context_usage: 
  current: 0%
  limit: 200000
  remaining_tokens: 200000
status: "active"
checkpoint_reason: "$Reason"

# === 完整性校验 (Verifiable) ===
code_hash: "$(git rev-parse HEAD 2>$null || 'N/A')"
test_status: "PENDING"
verification_command: "$(if($parentContent -match 'verification_command: "([^"]*)"'){$matches[1]}else{'npm test'})"
last_verified_output: ""

# === 审计线索 (Auditable) ===
prompt_version: ""
model_config: 
  temperature: 0.2
  top_p: 0.9
  system_prompt_hash: ""
tool_calls_count: 0

# === 恢复标记 (Recoverable) ===
recovery_priority: "normal"
rollback_target: "git:HEAD"
data_migration_id: null
---

# === 会话上下文摘要 (Context Digest) ===

## 1. 不可变约束 (Immutable Constraints)
> **⚠️ 新会话必须继承以下约束，不得违反**

"@

# 提取父会话的约束
if ($parentContent -match '## 1\. 不可变约束.*?(?=## 2\.)') {
    $constraints = $matches[0]
    $newContent += $constraints -replace '## 1\. 不可变约束.*\r?\n', ''
}

$newContent += @"

## 2. 当前状态 (Current State)

### 2.1 代码状态
```diff
# 继承自父会话，待更新
"@

# 尝试提取代码状态
if ($parentContent -match '### 2\.1 代码状态.*?```.*?```') {
    $codeState = $matches[0]
    $newContent += "`n" + ($codeState -replace '### 2\.1 代码状态.*?```diff', '').TrimEnd('`').Trim() + "`n```"
}

$newContent += @"
```

### 2.2 思维状态 (Cognitive State)
- **继承自父会话**:
"@

# 提取思维状态
if ($parentContent -match '\*\*已完成\*\*:([^\n]*)') {
    $newContent += "`n  - 已完成: $($matches[1].Trim())"
}
if ($parentContent -match '\*\*进行中\*\*:([^\n]*)') {
    $newContent += "`n  - 进行中: $($matches[1].Trim())"
}
if ($parentContent -match '\*\*待探索\*\*:([^\n]*)') {
    $newContent += "`n  - 待探索: $($matches[1].Trim())"
}

$newContent += @"

- **本会话目标**: [待填写]

### 2.3 阻塞点 (Blocked)
```json
{
  "issue": "",
  "reproduction": "",
  "attempted_solutions": [],
  "next_hypothesis": ""
}
```

## 3. 关键决策日志 (Session ADRs)

| 时间 | 决策 | 理由 | 替代方案 | 决策者 |
|------|------|------|----------|--------|

## 4. 资源引用 (Resources)

### 4.1 代码片段（新会话必需）
```typescript
// 从父会话继承的关键接口
"@

# 提取代码片段
if ($parentContent -match '### 4\.1 代码片段.*?```typescript(.*?)```') {
    $newContent += $matches[1]
}

$newContent += @"
```

### 4.2 测试用例（当前失败的）
```typescript
// 这是当前失败的测试，新会话需优先处理
"@

if ($parentContent -match '### 4\.2 测试用例.*?```typescript(.*?)```') {
    $newContent += $matches[1]
}

$newContent += @"
```

### 4.3 外部参考
- 父会话完整记录: $($parentSession.FullName -replace '\\', '/')

---

## 5. 续接指南 (Continuation Protocol)

**对于新会话，按以下顺序恢复上下文：**

### Step 1: 约束注入（必须）
首先向AI陈述不可变约束（上方第1节），要求确认理解。

### Step 2: 状态加载（必须）
提供代码片段（第4.1节）和当前失败测试（第4.2节）。

### Step 3: 认知恢复（建议）
简要说明:"我们刚从父会话分叉，原因是: $Reason"

### Step 4: 验证检查点（必须）
要求新会话首先运行验证命令，确认基础状态无损。

---

## 6. 排错线索 (Debugging Leads)

| 症状 | 可能原因 | 检查点 |
|------|---------|--------|
| | | |

---

**创建时间**: $(Get-Date -Format 'yyyy-MM-dd HH:mm')  
**创建者**: $(whoami)  
**分叉原因**: $Reason  
"@

# 5. 写入新会话文件
$newContent | Out-File -FilePath $newSessionPath -Encoding UTF8
Write-Output "  ✓ 创建新会话文件"

# 6. 更新当前指针
$currentLink = ".ai-sessions/active/current"
if (Test-Path "$currentLink.lnk") {
    Remove-Item "$currentLink.lnk" -Force
}
$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut("$(Resolve-Path '.ai-sessions/active')\current.lnk")
$shortcut.TargetPath = (Resolve-Path $newSessionPath).Path
$shortcut.Save()
Write-Output "  ✓ 更新当前会话指针"

# 7. 更新会话链
if ($ChainId) {
    $chainPath = ".ai-sessions/chains/chain-$ChainId.json"
    if (Test-Path $chainPath) {
        $chain = Get-Content $chainPath | ConvertFrom-Json
        $chain.current_tip = $sessionId
        $chain.sessions += @{
            id = $sessionId
            timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
            outcome = "active"
            summary = "分叉自 $Parent - $Reason"
            code_commit = git rev-parse HEAD 2>$null
            next_reason = ""
        }
        $chain | ConvertTo-Json -Depth 10 | Out-File -FilePath $chainPath -Encoding UTF8
        Write-Output "  ✓ 更新会话链: $ChainId"
    }
}

# 8. 生成迁移提示词
Write-Output ""
Write-ColorOutput Cyan "📝 请复制以下内容到新对话框:"
Write-Output "================================================"
Write-Output ""
Write-Output "[SYSTEM RESTORE PROTOCOL - V.A.R.C. Framework]"
Write-Output ""
Write-Output "你是该任务的接续AI。我们从检查点恢复会话。"
Write-Output ""
Write-Output "会话ID: $sessionId"
Write-Output "父会话: $Parent"
Write-Output "分叉原因: $Reason"
Write-Output ""

# 提取并显示约束
if ($parentContent -match '- \[.\] \*\*架构约束\*\*:.*') {
    Write-Output "**继承约束**（绝对不可违反）:"
    $constraints = [regex]::Matches($parentContent, '- \[.\] \*\*.*?\*\*:.*')
    foreach ($c in $constraints) {
        Write-Output $c.Value
    }
}

Write-Output ""
Write-Output "**当前任务**: 请先从父会话了解上下文，然后继续工作。"
Write-Output ""
Write-Output "**验证命令**: $(if($parentContent -match 'verification_command: "([^"]*)"'){$matches[1]}else{'npm test'})"
Write-Output ""
Write-Output "请先确认理解以上约束，然后列出当前目录结构验证环境。"

Write-Output ""
Write-ColorOutput Green "✅ 分叉完成! 新会话: $([System.IO.Path]::GetFileNameWithoutExtension($newSessionPath))"
