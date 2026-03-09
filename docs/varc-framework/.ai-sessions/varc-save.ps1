# V.A.R.C. 框架 - 会话保存脚本
# 用法: .\varc-save.ps1 -Reason "上下文达70%" [-Status checkpointed|completed|failed]

param(
    [Parameter(Mandatory=$true)]
    [string]$Reason,
    
    [ValidateSet("checkpointed", "completed", "failed", "migrated")]
    [string]$Status = "checkpointed",
    
    [string]$Priority = "normal",
    [switch]$SkipVerification,
    [switch]$SkipGit
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

# 读取配置
$config = @{}
if (Test-Path ".varc-config.yml") {
    # 简单解析 YAML (实际项目中建议使用 proper YAML parser)
    $configContent = Get-Content ".varc-config.yml" -Raw
}

# 获取当前会话
$currentLink = ".ai-sessions/active/current.lnk"
$currentSession = $null

if (Test-Path $currentLink) {
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut((Resolve-Path $currentLink))
    $currentSession = Get-Item $shortcut.TargetPath
}

# 如果没有当前会话，创建新的
if (!$currentSession) {
    $existing = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | Sort-Object Name
    $nextNum = 1
    if ($existing) {
        $last = $existing | Select-Object -Last 1
        if ($last.Name -match 'session-\d{8}-(\d{2})') {
            $nextNum = [int]$matches[1] + 1
        }
    }
    $sessionId = "sess_$(Get-Date -Format 'yyyyMMdd')_$($nextNum.ToString('D2'))_$((New-Guid).ToString().Substring(0,8))"
    $newSessionPath = ".ai-sessions/active/session-$(Get-Date -Format 'yyyyMMdd')-$($nextNum.ToString('D2'))-$($sessionId.Split('_')[3]).md"
    
    # 从模板创建
    $template = Get-Content ".ai-sessions/templates/session-snapshot-template.md" -Raw
    $template = $template -replace "sess_YYYYMMDD_NN_hash", $sessionId
    $template | Out-File -FilePath $newSessionPath -Encoding UTF8
    
    Write-ColorOutput Yellow "创建新会话: $([System.IO.Path]::GetFileName($newSessionPath))"
    Write-Output "请编辑此文件填写当前状态，然后再次运行保存命令。"
    exit 0
}

Write-ColorOutput Cyan "💾 保存会话: $($currentSession.Name)"
Write-Output "================================================"

# 1. 获取 Git 状态
Write-ColorOutput Yellow "📋 收集元数据..."
$gitHash = "N/A"
$gitDirty = $false
try {
    $gitHash = git rev-parse HEAD 2>$null
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) { $gitDirty = $true }
    Write-Output "  ✓ Git commit: $gitHash$(if($gitDirty){' (dirty)'})"
} catch {
    Write-Output "  ⚠️  未检测到 Git 仓库"
}

# 2. 运行验证 (如果配置)
if (!$SkipVerification -and (Test-Path ".varc-config.yml")) {
    Write-ColorOutput Yellow "🔍 运行验证..."
    # 这里可以解析配置并运行验证命令
    # 简化版本，询问用户
    $testStatus = Read-Host "测试状态 (PASS/FAIL/PENDING)"
} else {
    $testStatus = "PENDING"
}

# 3. 生成会话内容
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$content = Get-Content $currentSession.FullName -Raw

# 更新元数据
$content = $content -replace "status: \"active\"", "status: \"$Status\""
$content = $content -replace "status: \"checkpointed\"", "status: \"$Status\""
$content = $content -replace "checkpoint_reason: \"[^\"]*\"", "checkpoint_reason: \"$Reason\""
$content = $content -replace "test_status: \"[^\"]*\"", "test_status: \"$testStatus\""
$content = $content -replace "code_hash: \"[^\"]*\"", "code_hash: \"sha256:$gitHash\""
$content = $content -replace "recovery_priority: \"[^\"]*\"", "recovery_priority: \"$Priority\""

# 更新时间戳
$content = $content -replace "\*\*保存时间\*\*: .*", "**保存时间**: $timestamp"

# 4. 保存文件
$content | Out-File -FilePath $currentSession.FullName -Encoding UTF8
Write-Output "  ✓ 更新会话文件"

# 5. Git 提交 (如果启用)
if (!$SkipGit -and (Test-Path ".git")) {
    $shouldCommit = Read-Host "是否提交到 Git? (y/n)"
    if ($shouldCommit -eq 'y') {
        git add -A
        $commitMsg = "[VARC] $($currentSession.BaseName) - $Reason"
        git commit -m $commitMsg
        Write-Output "  ✓ Git 提交: $commitMsg"
    }
}

# 6. 归档 (如果完成)
if ($Status -eq "completed") {
    $archiveDir = ".ai-sessions/archive/$(Get-Date -Format 'yyyy-MM')"
    if (!(Test-Path $archiveDir)) {
        New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
    }
    $archivePath = "$archiveDir/$($currentSession.Name)"
    Move-Item $currentSession.FullName $archivePath
    Write-Output "  ✓ 归档到: $archivePath"
}

Write-Output ""
Write-ColorOutput Green "✅ 会话保存完成!"
Write-Output "================================================"

# 7. 提示下一步
if ($Status -eq "checkpointed") {
    Write-ColorOutput Cyan "💡 建议下一步:"
    Write-Output "  1. 检查当前上下文使用率"
    Write-Output "  2. 如上下文即将耗尽，运行: .\varc-fork.ps1"
    Write-Output "  3. 将当前会话摘要复制到新对话框继续"
}
