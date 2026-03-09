#!/usr/bin/env pwsh
# V.A.R.C. v2.0 - 智能一键保存（零摩擦）
# 用法: .\varc-quick-save.ps1 [--silent]

param(
    [switch]$Silent,           # 静默模式（用于Git钩子）
    [string]$Reason,           # 可选：手动指定原因（否则自动推断）
    [switch]$NoVerify          # 跳过验证
)

$ErrorActionPreference = "Stop"

# ==================== 智能推断函数 ====================

function Get-InferredReason {
    # 1. 尝试从 Git commit message 获取
    try {
        $gitMsg = git log -1 --pretty=%B 2>$null
        if ($gitMsg -and $gitMsg -notmatch "^\s*$") {
            return $gitMsg.Trim().Split("`n")[0]
        }
    } catch {}
    
    # 2. 尝试从最近的文件变更推断
    try {
        $changedFiles = git diff --name-only HEAD~1 2>$null
        if ($changedFiles) {
            $fileCount = ($changedFiles -split "`n").Count
            $sampleFile = ($changedFiles -split "`n")[0] | Split-Path -Leaf
            return "修改 $fileCount 个文件 ($sampleFile 等)"
        }
    } catch {}
    
    # 3. 默认原因
    return "定期保存 - $(Get-Date -Format 'HH:mm')"
}

function Get-TestStatus {
    param([string]$Command)
    
    if ($NoVerify -or [string]::IsNullOrEmpty($Command)) {
        return "PENDING"
    }
    
    try {
        $output = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            return "PASS"
        } else {
            return "FAIL"
        }
    } catch {
        return "ERROR"
    }
}

function Get-ContextUsage {
    # v2.0: 模拟上下文使用率（未来可对接AI API获取真实值）
    # 基于文件大小和会话数量估算
    
    $sessionFiles = Get-ChildItem ".ai-sessions/active/*.md" -ErrorAction SilentlyContinue
    $fileCount = if ($sessionFiles) { $sessionFiles.Count } else { 0 }
    
    # 简单估算：每个会话约占用5%上下文
    $estimated = [Math]::Min($fileCount * 5 + 10, 95)
    
    return @{
        Percentage = $estimated
        Tokens = [int]($estimated * 2000)  # 假设20k上下文
        Remaining = [int]((100 - $estimated) * 2000)
    }
}

function Get-PriorityFromContext {
    param([int]$ContextPercentage)
    
    if ($ContextPercentage -ge 80) { return "critical" }
    if ($ContextPercentage -ge 60) { return "high" }
    return "normal"
}

# ==================== 主流程 ====================

function Write-Info {
    param([string]$Message)
    if (!$Silent) {
        Write-Output $Message
    }
}

# 找到当前会话
$currentLink = ".ai-sessions/active/current.lnk"
$currentSession = $null

if (Test-Path $currentLink) {
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut((Resolve-Path $currentLink).Path)
    $currentSession = Get-Item $shortcut.TargetPath -ErrorAction SilentlyContinue
}

if (!$currentSession) {
    # 没有当前会话，创建新的
    $timestamp = Get-Date -Format "yyyyMMdd"
    $nextNum = 1
    $existing = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | Sort-Object Name
    if ($existing) {
        $todaySessions = $existing | Where-Object { $_.Name -match "session-$timestamp" }
        if ($todaySessions) {
            $nums = $todaySessions | ForEach-Object { 
                if ($_.Name -match 'session-\d{8}-(\d{2})') { [int]$matches[1] }
            } | Sort-Object
            $nextNum = $nums[-1] + 1
        }
    }
    
    $newSessionPath = ".ai-sessions/active/session-$timestamp-$($nextNum.ToString('D2'))-new.md"
    @"---
session_id: "sess_${timestamp}_$($nextNum.ToString('D2'))_$(-join ((97..122) | Get-Random -Count 6 | ForEach-Object { [char]$_ }))"
status: "active"
created_at: "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
---

# 新会话

## 约束
- [ ] 待填写

## 状态
- **进行中**: 待填写
"@ | Out-File -FilePath $newSessionPath -Encoding UTF8
    
    $currentSession = Get-Item $newSessionPath
    
    # 更新 current 链接
    if (Test-Path $currentLink) { Remove-Item $currentLink -Force }
    $shortcut = $WshShell.CreateShortcut((Resolve-Path .).Path + "\$currentLink")
    $shortcut.TargetPath = (Resolve-Path $newSessionPath).Path
    $shortcut.Save()
    
    Write-Info "📝 创建新会话: $(Split-Path -Leaf $newSessionPath)"
}

# 读取当前会话内容
$sessionContent = Get-Content $currentSession.FullName -Raw

# 智能推断元数据
Write-Info "🧠 智能推断中..."

$inferredReason = if ($Reason) { $Reason } else { Get-InferredReason }
$contextInfo = Get-ContextUsage
$priority = Get-PriorityFromContext $contextInfo.Percentage
$gitHash = git rev-parse HEAD 2>$null

# 运行验证命令获取测试状态
$configPath = ".varc-config.yml"
$verifyCommand = "npm test"
if (Test-Path $configPath) {
    # 简单解析配置获取验证命令
    $config = Get-Content $configPath -Raw
    if ($config -match 'default_command:\s*"([^"]*)"') {
        $verifyCommand = $matches[1]
    }
}
$testStatus = Get-TestStatus -Command $verifyCommand

# 更新会话内容
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# 更新元数据（使用正则替换）
$sessionContent = $sessionContent -replace '(?m)^saved_at:.*$', "saved_at: \"$timestamp\""
$sessionContent = $sessionContent -replace '(?m)^save_reason:.*$', "save_reason: \"$inferredReason\""
$sessionContent = $sessionContent -replace '(?m)^test_status:.*$', "test_status: \"$testStatus\""
$sessionContent = $sessionContent -replace '(?m)^context_usage:.*$', "context_usage: $($contextInfo.Percentage)%"
$sessionContent = $sessionContent -replace '(?m)^code_hash:.*$', "code_hash: \"$gitHash\""
$sessionContent = $sessionContent -replace '(?m)^priority:.*$', "priority: \"$priority\""

# 如果字段不存在，添加它们
if ($sessionContent -notmatch '(?m)^saved_at:') {
    $sessionContent = $sessionContent -replace '^(---\s*)', "`$1`nsaved_at: `"$timestamp`"`nsave_reason: `"$inferredReason`"`ntest_status: `"$testStatus`"`ncontext_usage: $($contextInfo.Percentage)%`ncode_hash: `"$gitHash`"`npriority: `"$priority`"`n"
}

# 保存文件
$sessionContent | Out-File -FilePath $currentSession.FullName -Encoding UTF8

# 输出结果
if (!$Silent) {
    Write-Info ""
    Write-Info "✅ 会话已保存"
    Write-Info "================================================"
    Write-Info "💾 会话 ID: $(if($sessionContent -match 'session_id:\s*"([^"]*)"') { $matches[1] })"
    Write-Info "📝 保存原因: $inferredReason"
    Write-Info "🧪 测试状态: $testStatus"
    Write-Info "📊 上下文使用: $($contextInfo.Percentage)%"
    Write-Info "⚡ 优先级: $priority"
    Write-Info "================================================"
    
    if ($contextInfo.Percentage -ge 75) {
        Write-Info ""
        Write-Info "⚠️  上下文即将耗尽！建议运行: vf (varc-fork)"
    }
}

# 返回保存的会话路径（供其他脚本使用）
return $currentSession.FullName
