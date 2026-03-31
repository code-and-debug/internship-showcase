#!/usr/bin/env pwsh
# V.A.R.C. v2.0 - 初始化脚本（全自动配置）
# 用法: .\varc-init-v2.ps1 [-AutoConfigure]

param(
    [switch]$AutoConfigure,
    [string]$ProjectName = (Split-Path -Leaf (Get-Location))
)

$ErrorActionPreference = "Stop"
$VARC_VERSION = "2.0.0"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Logo {
    Write-ColorOutput Cyan @"
    ██╗   ██╗ █████╗ ██████╗  ██████╗
    ██║   ██║██╔══██╗██╔══██╗██╔════╝
    ██║   ██║███████║██████╔╝██║     
    ╚██╗ ██╔╝██╔══██║██╔══██╗██║     
     ╚████╔╝ ██║  ██║██║  ██║╚██████╗
      ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝
         Framework v$VARC_VERSION
"@
}

function Initialize-DirectoryStructure {
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
            Write-Output "  ✓ $dir"
        }
    }
}

function Install-GitHooks {
    Write-ColorOutput Yellow "🔧 安装 Git 钩子..."
    
    if (!(Test-Path ".git")) {
        Write-ColorOutput Red "  ⚠️  未找到 .git 目录，跳过 Git 钩子安装"
        return
    }
    
    # Pre-commit 钩子：提交前自动保存
    $preCommit = @'
#!/bin/sh
# V.A.R.C. Auto-Save Hook
if [ -f ".varc/scripts/varc-quick-save.ps1" ]; then
    pwsh -File .varc/scripts/varc-quick-save.ps1 --silent
fi
'@
    
    $preCommitPath = ".git/hooks/pre-commit"
    if (Test-Path $preCommitPath) {
        $existing = Get-Content $preCommitPath -Raw
        if ($existing -notmatch "V.A.R.C.") {
            Add-Content $preCommitPath -Value "`n# V.A.R.C. Auto-Save`n$preCommit"
        }
    } else {
        $preCommit | Out-File -FilePath $preCommitPath -Encoding UTF8
    }
    
    Write-Output "  ✓ pre-commit 钩子已安装"
}

function Set-ShortcutAliases {
    Write-ColorOutput Yellow "⚡ 配置快捷命令..."
    
    $profileContent = @"

# V.A.R.C. v2.0 快捷命令
function varc-save { .\scripts\varc-quick-save.ps1 @args }
function varc-fork { .\scripts\varc-fork-v2.ps1 -AutoCopy @args }
function varc-doctor { .\scripts\varc-doctor.ps1 @args }
function varc-report { .\scripts\varc-report.ps1 @args }
function varc-auto { .\scripts\varc-auto.ps1 -Mode daemon @args }

Set-Alias -Name vs -Value varc-save
Set-Alias -Name vf -Value varc-fork
Set-Alias -Name vd -Value varc-doctor
Set-Alias -Name vr -Value varc-report
Set-Alias -Name va -Value varc-auto
"@
    
    # 添加到当前用户 profile
    $profilePath = $PROFILE.CurrentUserCurrentHost
    if (!(Test-Path $profilePath)) {
        New-Item -ItemType File -Path $profilePath -Force | Out-Null
    }
    
    $currentProfile = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
    if ($currentProfile -notmatch "V.A.R.C. v2.0") {
        Add-Content -Path $profilePath -Value $profileContent
        Write-Output "  ✓ 快捷命令已添加到 PowerShell Profile"
        Write-Output "    vs = varc-quick-save"
        Write-Output "    vf = varc-fork-v2 -AutoCopy"
        Write-Output "    vd = varc-doctor"
        Write-Output "    vr = varc-report"
        Write-Output "    va = varc-auto -Mode daemon"
    }
}

function Initialize-ConfigFile {
    Write-ColorOutput Yellow "⚙️  创建配置文件..."
    
    $configPath = ".varc-config.yml"
    if (Test-Path $configPath) {
        Write-Output "  ℹ️  配置文件已存在，跳过"
        return
    }
    
    $config = @"
# V.A.R.C. v2.0 配置
version: "$VARC_VERSION"
project:
  name: "$ProjectName"
  created_at: "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# 自动保存配置
auto_save:
  enabled: true
  triggers:
    - type: "git_commit"
      enabled: true
    - type: "time_interval"
      enabled: true
      interval: "10m"
    - type: "file_change"
      enabled: true
      patterns: ["*.spec.ts", "*.test.ts", "*.md"]

# 智能推断配置
smart_inference:
  reason_from_git: true
  status_from_tests: true
  priority_from_context: true

# 验证配置
verification:
  default_command: "npm test"
  auto_run: true
  block_on_fail: false

# 快捷命令
aliases:
  vs: "varc-quick-save"
  vf: "varc-fork-v2 -AutoCopy"
  vd: "varc-doctor"
  vr: "varc-report"
  va: "varc-auto -Mode daemon"
"@
    
    $config | Out-File -FilePath $configPath -Encoding UTF8
    Write-Output "  ✓ 配置文件已创建: $configPath"
}

function Initialize-FirstSession {
    Write-ColorOutput Yellow "📝 创建初始会话..."
    
    $timestamp = Get-Date -Format "yyyyMMdd"
    $sessionId = "sess_${timestamp}_01_$(-join ((65..90) + (97..122) | Get-Random -Count 6 | ForEach-Object { [char]$_ }))"
    $sessionPath = ".ai-sessions/active/session-${timestamp}-01-init.md"
    
    if (Test-Path $sessionPath) {
        Write-Output "  ℹ️  初始会话已存在"
        return
    }
    
    $sessionContent = @"
---
session_id: "$sessionId"
parent_session: null
status: "active"
created_at: "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
---

# $ProjectName - 初始会话

## 约束（待填写）
- [ ] 架构约束:
- [ ] 性能约束:
- [ ] 安全约束:

## 当前状态
- **进行中**: 项目初始化
- **阻塞点**: 无

## 资源
- 代码片段: 待添加
- 测试用例: 待添加
"@
    
    $sessionContent | Out-File -FilePath $sessionPath -Encoding UTF8
    
    # 创建 current 链接
    $currentLink = ".ai-sessions/active/current.lnk"
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut((Resolve-Path .).Path + "\$currentLink")
    $shortcut.TargetPath = (Resolve-Path $sessionPath).Path
    $shortcut.Save()
    
    Write-Output "  ✓ 初始会话: $sessionPath"
}

# ==================== 主流程 ====================

Show-Logo
Write-Output ""
Write-ColorOutput Green "🚀 初始化 V.A.R.C. v$VARC_VERSION"
Write-Output "================================================"
Write-Output ""

Initialize-DirectoryStructure

if ($AutoConfigure) {
    Install-GitHooks
    Set-ShortcutAliases
}

Initialize-ConfigFile
Initialize-FirstSession

Write-Output ""
Write-ColorOutput Green "✅ 初始化完成!"
Write-Output "================================================"
Write-Output ""
Write-Output "项目: $ProjectName"
Write-Output ""
Write-ColorOutput Cyan "📖 下一步:"
Write-Output "  1. 编辑 .varc-config.yml 配置验证命令"
Write-Output "  2. 运行 .\scripts\varc-quick-save.ps1 测试保存"
Write-Output ""
Write-ColorOutput Cyan "💡 快捷命令:$(if(!$AutoConfigure){' (运行带 -AutoConfigure 自动配置)'})"
if ($AutoConfigure) {
    Write-Output "  vs - 一键保存"
    Write-Output "  vf - 一键分叉"
    Write-Output "  vd - 健康检查"
    Write-Output "  vr - 统计报告"
    Write-Output "  va - 启动守护模式"
}
Write-Output ""
