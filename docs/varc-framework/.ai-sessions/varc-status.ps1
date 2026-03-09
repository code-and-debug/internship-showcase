# V.A.R.C. 框架 - 状态查看脚本
# 用法: .\varc-status.ps1

$ErrorActionPreference = "SilentlyContinue"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Format-TimeAgo($datetime) {
    $diff = (Get-Date) - $datetime
    if ($diff.TotalDays -ge 1) { return "$([int]$diff.TotalDays)天前" }
    if ($diff.TotalHours -ge 1) { return "$([int]$diff.TotalHours)小时前" }
    if ($diff.TotalMinutes -ge 1) { return "$([int]$diff.TotalMinutes)分钟前" }
    return "刚刚"
}

Write-ColorOutput Cyan "📊 V.A.R.C. 框架状态"
Write-Output "================================================"
Write-Output ""

# 1. 配置信息
if (Test-Path ".varc-config.yml") {
    $config = Get-Content ".varc-config.yml" -Raw
    if ($config -match 'name:\s*"?([^"\r\n]+)"?') {
        Write-ColorOutput Yellow "项目: $($matches[1])"
    }
    if ($config -match 'version:\s*"?([^"\r\n]+)"?') {
        Write-Output "框架版本: $($matches[1])"
    }
} else {
    Write-ColorOutput Yellow "⚠️  未找到 .varc-config.yml"
}
Write-Output ""

# 2. 当前会话
Write-ColorOutput Yellow "📝 当前会话"
Write-Output "------------------------------------------------"

$currentLink = ".ai-sessions/active/current.lnk"
if (Test-Path $currentLink) {
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut((Resolve-Path $currentLink))
    $currentSession = Get-Item $shortcut.TargetPath -ErrorAction SilentlyContinue
    
    if ($currentSession) {
        $content = Get-Content $currentSession.FullName -Raw
        
        # 提取会话信息
        $sessionId = if ($content -match 'session_id:\s*"([^"]*)"') { $matches[1] } else { "N/A" }
        $status = if ($content -match 'status:\s*"([^"]*)"') { $matches[1] } else { "unknown" }
        $contextUsage = if ($content -match 'current:\s*(\d+%)') { $matches[1] } else { "?" }
        $checkpointReason = if ($content -match 'checkpoint_reason:\s*"([^"]*)"') { $matches[1] } else { "" }
        
        $statusEmoji = switch ($status) {
            "active" { "🟢" }
            "checkpointed" { "💾" }
            "completed" { "✅" }
            "failed" { "❌" }
            default { "⚪" }
        }
        
        Write-Output "会话文件: $($currentSession.Name)"
        Write-Output "会话ID:   $sessionId"
        Write-Output "状态:     $statusEmoji $status"
        Write-Output "上下文:   $contextUsage"
        if ($checkpointReason) {
            Write-Output "保存原因: $checkpointReason"
        }
        Write-Output "修改时间: $(Format-TimeAgo $currentSession.LastWriteTime)"
    }
} else {
    $activeSessions = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($activeSessions) {
        Write-Output "当前无活动指针，最近会话:"
        $activeSessions | Select-Object -First 3 | ForEach-Object {
            Write-Output "  - $($_.Name) ($(Format-TimeAgo $_.LastWriteTime))"
        }
    } else {
        Write-Output "暂无活跃会话"
    }
}
Write-Output ""

# 3. 活跃会话列表
Write-ColorOutput Yellow "📁 活跃会话 ($( @(Get-ChildItem '.ai-sessions/active/session-*.md' -ErrorAction SilentlyContinue).Count ))"
Write-Output "------------------------------------------------"

$activeSessions = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
if ($activeSessions) {
    $activeSessions | Select-Object -First 5 | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $status = if ($content -match 'status:\s*"([^"]*)"') { $matches[1] } else { "unknown" }
        $emoji = switch ($status) {
            "active" { "🟢" }
            "checkpointed" { "💾" }
            "completed" { "✅" }
            "failed" { "❌" }
            default { "⚪" }
        }
        Write-Output "$emoji $($_.Name) ($(Format-TimeAgo $_.LastWriteTime))"
    }
    if ($activeSessions.Count -gt 5) {
        Write-Output "... 还有 $($activeSessions.Count - 5) 个会话"
    }
} else {
    Write-Output "无活跃会话"
}
Write-Output ""

# 4. 会话链
Write-ColorOutput Yellow "🔗 会话链 ($( @(Get-ChildItem '.ai-sessions/chains/chain-*.json' -ErrorAction SilentlyContinue).Count ))"
Write-Output "------------------------------------------------"

$chains = Get-ChildItem ".ai-sessions/chains/chain-*.json" -ErrorAction SilentlyContinue
if ($chains) {
    $chains | ForEach-Object {
        $chain = Get-Content $_.FullName | ConvertFrom-Json
        $statusEmoji = if ($chain.status -eq "active") { "🟢" } else { "⚪" }
        $sessionCount = $chain.sessions.Count
        Write-Output "$statusEmoji $($chain.chain_id) ($sessionCount 个会话) - $($chain.description)"
    }
} else {
    Write-Output "无会话链"
}
Write-Output ""

# 5. 归档统计
Write-ColorOutput Yellow "📦 归档"
Write-Output "------------------------------------------------"

$archiveDirs = Get-ChildItem ".ai-sessions/archive/*" -Directory -ErrorAction SilentlyContinue
if ($archiveDirs) {
    $totalArchived = 0
    $archiveDirs | ForEach-Object {
        $count = @(Get-ChildItem "$($_.FullName)/*.md" -ErrorAction SilentlyContinue).Count
        $totalArchived += $count
        Write-Output "$($_.Name): $count 个会话"
    }
    Write-Output "总计: $totalArchived 个已归档会话"
} else {
    Write-Output "无归档会话"
}
Write-Output ""

# 6. 快速操作提示
Write-ColorOutput Cyan "💡 快速操作"
Write-Output "------------------------------------------------"
Write-Output ".\varc-save.ps1 -Reason '描述'    # 保存当前会话"
Write-Output ".\varc-fork.ps1 -Parent [ID]     # 分叉新会话"
Write-Output ".\varc-init.ps1 -ProjectName [name]  # 重新初始化"
Write-Output ""
