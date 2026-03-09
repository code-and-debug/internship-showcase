#!/usr/bin/env pwsh
# V.A.R.C. v2.0 - 一键分叉（自动复制到剪贴板）
# 用法: .\varc-fork-v2.ps1 [-AutoCopy] [-Parent <session-id>]

param(
    [switch]$AutoCopy,          # 自动复制到剪贴板
    [string]$Parent,            # 可选：指定父会话（否则自动检测当前）
    [string]$Reason = "上下文耗尽"  # 分叉原因
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms

# ==================== 核心函数 ====================

function Get-CurrentSession {
    $currentLink = ".ai-sessions/active/current.lnk"
    
    if (Test-Path $currentLink) {
        $WshShell = New-Object -ComObject WScript.Shell
        $shortcut = $WshShell.CreateShortcut((Resolve-Path $currentLink).Path)
        $targetPath = $shortcut.TargetPath
        if (Test-Path $targetPath) {
            return Get-Item $targetPath
        }
    }
    
    # 回退：找最新的会话文件
    $latest = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | 
              Sort-Object LastWriteTime -Descending | 
              Select-Object -First 1
    
    return $latest
}

function Extract-SessionInfo {
    param([string]$Content)
    
    $info = @{}
    
    # 提取会话ID
    if ($Content -match 'session_id:\s*"([^"]*)"') {
        $info.SessionId = $matches[1]
    }
    
    # 提取约束
    $constraints = @()
    if ($Content -match '##\s*约束.*?(?=##|\Z)') {
        $constraintsSection = $matches[0]
        $constraints = [regex]::Matches($constraintsSection, '-\s*\[.\]\s*(.+?)(?=\r?\n|$)') | 
                       ForEach-Object { $_.Groups[1].Value.Trim() }
    }
    $info.Constraints = $constraints
    
    # 提取代码片段
    $codeSnippet = ""
    if ($Content -match '```[a-z]*\n(.*?)```') {
        $codeSnippet = $matches[1]
    }
    $info.CodeSnippet = $codeSnippet
    
    # 提取阻塞点
    $blockedInfo = ""
    if ($Content -match '阻塞点.*?(?=##|\Z)') {
        $blockedInfo = ($matches[0] -replace '.*阻塞点', '').Trim()
    }
    $info.Blocked = $blockedInfo
    
    return $info
}

function Generate-ForkPrompt {
    param(
        [string]$ParentId,
        [string]$NewId,
        [string]$Reason,
        [array]$Constraints,
        [string]$CodeSnippet,
        [string]$BlockedInfo
    )
    
    $constraintText = if ($Constraints.Count -gt 0) {
        $Constraints -join "`n- "
    } else {
        "待补充"
    }
    
    $prompt = @"
[SYSTEM RESTORE PROTOCOL - V.A.R.C. v2.0]

你是该任务的接续AI。我们从检查点恢复会话。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 会话信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
会话ID: $NewId
父会话: $ParentId
分叉原因: $Reason

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  继承约束（绝对不可违反）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- $constraintText

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 当前代码状态
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```typescript
$CodeSnippet
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚧 当前阻塞点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$BlockedInfo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 续接任务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 确认理解以上约束
2. 列出当前目录结构验证环境
3. 继续解决阻塞点

请先回复："已理解约束，环境验证中..."
"@
    
    return $prompt
}

# ==================== 主流程 ====================

Write-Output "🌿 V.A.R.C. v2.0 - 一键分叉"
Write-Output "================================================"
Write-Output ""

# 获取父会话
$parentSession = if ($Parent) {
    $path = ".ai-sessions/active/$Parent.md"
    if (Test-Path $path) { Get-Item $path } else { $null }
} else {
    Get-CurrentSession
}

if (!$parentSession) {
    Write-Error "❌ 找不到当前会话。请先运行 varc-quick-save 创建会话。"
    exit 1
}

Write-Output "📄 父会话: $(Split-Path -Leaf $parentSession.Name)"

# 读取并解析父会话内容
$parentContent = Get-Content $parentSession.FullName -Raw
$parentInfo = Extract-SessionInfo -Content $parentContent

# 生成新会话ID
$timestamp = Get-Date -Format "yyyyMMdd"
$existing = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | Sort-Object Name
$nextNum = 1
if ($existing) {
    $todaySessions = $existing | Where-Object { $_.Name -match "session-$timestamp" }
    if ($todaySessions) {
        $nums = $todaySessions | ForEach-Object { 
            if ($_.Name -match 'session-\d{8}-(\d{2})') { [int]$matches[1] }
        } | Sort-Object
        if ($nums.Count -gt 0) { $nextNum = $nums[-1] + 1 }
    }
}

$randomSuffix = -join ((97..122) | Get-Random -Count 6 | ForEach-Object { [char]$_ })
$newSessionId = "sess_${timestamp}_$($nextNum.ToString('D2'))_${randomSuffix}"
$newSessionPath = ".ai-sessions/active/session-$timestamp-$($nextNum.ToString('D2'))-${randomSuffix}.md"

Write-Output "📝 新会话: $(Split-Path -Leaf $newSessionPath)"

# 生成分叉提示词
$forkPrompt = Generate-ForkPrompt `
    -ParentId $parentInfo.SessionId `
    -NewId $newSessionId `
    -Reason $Reason `
    -Constraints $parentInfo.Constraints `
    -CodeSnippet $parentInfo.CodeSnippet `
    -BlockedInfo $parentInfo.Blocked

# 创建新会话文件（简化版）
$newSessionContent = @"
---
session_id: "$newSessionId"
parent_session: "$($parentInfo.SessionId)"
status: "active"
fork_reason: "$Reason"
created_at: "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
---

# 从 $($parentInfo.SessionId) 分叉

## 继承的约束
$(if ($parentInfo.Constraints.Count -gt 0) { $parentInfo.Constraints | ForEach-Object { "- [ ] $_" } } else { "- [ ] 待填写" })

## 当前状态
- **进行中**: 续接父会话任务
- **阻塞点**: $(if ($parentInfo.Blocked) { "继承自父会话" } else { "待更新" })

## 资源
- 代码片段: 见父会话
- 分叉提示词: 已生成
"@

$newSessionContent | Out-File -FilePath $newSessionPath -Encoding UTF8

# 更新 current 链接
$currentLink = ".ai-sessions/active/current.lnk"
if (Test-Path $currentLink) { Remove-Item $currentLink -Force }
$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut((Resolve-Path .).Path + "\$currentLink")
$shortcut.TargetPath = (Resolve-Path $newSessionPath).Path
$shortcut.Save()

# 复制到剪贴板
if ($AutoCopy) {
    [System.Windows.Forms.Clipboard]::SetText($forkPrompt)
    Write-Output ""
    Write-Output "✅ 已生成恢复提示词"
    Write-Output "📋 已复制到剪贴板"
    Write-Output ""
    Write-Output "💡 下一步：直接粘贴到新对话框即可"
} else {
    Write-Output ""
    Write-Output "📝 恢复提示词："
    Write-Output "================================================"
    Write-Output $forkPrompt
}

Write-Output ""
Write-Output "================================================"
Write-Output "✅ 分叉完成!"
Write-Output "新会话 ID: $newSessionId"
