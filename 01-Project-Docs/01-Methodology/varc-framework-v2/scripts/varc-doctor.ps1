#!/usr/bin/env pwsh
# V.A.R.C. v2.0 - 健康检查与自动修复
# 用法: .\varc-doctor.ps1 [-Fix] [--full]

param(
    [switch]$Fix,               # 自动修复发现的问题
    [switch]$Full               # 完整检查（包括历史会话）
)

$ErrorActionPreference = "Stop"

# ==================== 检查函数 ====================

function Test-DirectoryStructure {
    $issues = @()
    $requiredDirs = @(
        ".ai-sessions/active",
        ".ai-sessions/archive",
        ".ai-sessions/chains",
        ".ai-sessions/recovery"
    )
    
    foreach ($dir in $requiredDirs) {
        if (!(Test-Path $dir)) {
            $issues += @{
                Severity = "ERROR"
                Message = "缺少目录: $dir"
                Fix = "New-Item -ItemType Directory -Force -Path '$dir'"
            }
        }
    }
    
    return $issues
}

function Test-ConfigFile {
    $issues = @()
    $configPath = ".varc-config.yml"
    
    if (!(Test-Path $configPath)) {
        $issues += @{
            Severity = "WARNING"
            Message = "配置文件不存在: $configPath"
            Fix = "创建默认配置文件"
        }
    } else {
        $content = Get-Content $configPath -Raw
        if ($content -notmatch "version:") {
            $issues += @{
                Severity = "WARNING"
                Message = "配置文件缺少 version 字段"
                Fix = "添加 version: \"2.0.0\""
            }
        }
    }
    
    return $issues
}

function Test-SessionFiles {
    param([switch]$CheckAll)
    
    $issues = @()
    $searchPath = if ($CheckAll) { ".ai-sessions" } else { ".ai-sessions/active" }
    
    $sessionFiles = Get-ChildItem "$searchPath/session-*.md" -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $sessionFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        # 检查必需的 Frontmatter 字段
        $requiredFields = @("session_id", "status")
        foreach ($field in $requiredFields) {
            if ($content -notmatch "^$field:") {
                $issues += @{
                    Severity = "ERROR"
                    Message = "$($file.Name) 缺少必需字段: $field"
                    Fix = "添加 $field 到文件头"
                    File = $file.FullName
                }
            }
        }
        
        # 检查 status 值是否有效
        if ($content -match 'status:\s*"?([^"\r\n]+)"?') {
            $status = $matches[1].Trim()
            $validStatuses = @("active", "checkpointed", "completed", "failed", "migrated")
            if ($validStatuses -notcontains $status) {
                $issues += @{
                    Severity = "WARNING"
                    Message = "$($file.Name) 包含无效的 status: $status"
                    Fix = "将 status 改为有效值: $($validStatuses -join ', ')"
                    File = $file.FullName
                }
            }
        }
    }
    
    return $issues
}

function Test-CurrentLink {
    $issues = @()
    $currentLink = ".ai-sessions/active/current.lnk"
    
    if (!(Test-Path $currentLink)) {
        $issues += @{
            Severity = "WARNING"
            Message = "current.lnk 不存在"
            Fix = "创建指向最新会话的链接"
        }
    } else {
        $WshShell = New-Object -ComObject WScript.Shell
        $shortcut = $WshShell.CreateShortcut((Resolve-Path $currentLink).Path)
        if (!(Test-Path $shortcut.TargetPath)) {
            $issues += @{
                Severity = "ERROR"
                Message = "current.lnk 指向不存在的文件"
                Fix = "更新 current.lnk 指向最新会话"
            }
        }
    }
    
    return $issues
}

function Test-ChainContinuity {
    $issues = @()
    $chainFiles = Get-ChildItem ".ai-sessions/chains/chain-*.json" -ErrorAction SilentlyContinue
    
    foreach ($chainFile in $chainFiles) {
        try {
            $chain = Get-Content $chainFile.FullName | ConvertFrom-Json
            
            # 检查 current_tip 是否存在
            $tipExists = Get-ChildItem ".ai-sessions" -Recurse -Filter "$($chain.current_tip).md" -ErrorAction SilentlyContinue
            if (!$tipExists) {
                $issues += @{
                    Severity = "WARNING"
                    Message = "会话链 $($chainFile.BaseName) 的 current_tip 指向不存在的会话"
                    Fix = "更新 current_tip 为存在的会话"
                }
            }
        } catch {
            $issues += @{
                Severity = "ERROR"
                Message = "会话链文件格式错误: $($chainFile.Name)"
                Fix = "修复 JSON 格式"
            }
        }
    }
    
    return $issues
}

function Test-GitIntegration {
    $issues = @()
    
    if (Test-Path ".git") {
        $preCommit = ".git/hooks/pre-commit"
        if (!(Test-Path $preCommit) -or (Get-Content $preCommit -Raw -ErrorAction SilentlyContinue) -notmatch "V.A.R.C.") {
            $issues += @{
                Severity = "INFO"
                Message = "Git pre-commit 钩子未安装 V.A.R.C. 集成"
                Fix = "运行 varc-init-v2.ps1 -AutoConfigure 安装钩子"
            }
        }
    }
    
    return $issues
}

# ==================== 修复函数 ====================

function Invoke-Fixes {
    param([array]$Issues)
    
    $fixed = 0
    $failed = 0
    
    foreach ($issue in $Issues) {
        Write-Output "🔧 修复: $($issue.Message)"
        
        try {
            switch -Wildcard ($issue.Message) {
                "缺少目录:*" {
                    $dir = $issue.Message -replace "缺少目录: ", ""
                    New-Item -ItemType Directory -Force -Path $dir | Out-Null
                    Write-Output "   ✅ 已创建目录"
                    $fixed++
                }
                
                "配置文件不存在*" {
                    @"
# V.A.R.C. v2.0 配置
version: "2.0.0"
project:
  name: "$(Split-Path -Leaf (Get-Location))"
  created_at: "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

auto_save:
  enabled: true
  triggers:
    - type: "git_commit"
      enabled: true

smart_inference:
  reason_from_git: true
  status_from_tests: true

verification:
  default_command: "npm test"
  auto_run: false
"@ | Out-File -FilePath ".varc-config.yml" -Encoding UTF8
                    Write-Output "   ✅ 已创建默认配置文件"
                    $fixed++
                }
                
                "current.lnk 不存在" {
                    $latest = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | 
                              Sort-Object LastWriteTime -Descending | 
                              Select-Object -First 1
                    if ($latest) {
                        $WshShell = New-Object -ComObject WScript.Shell
                        $shortcut = $WshShell.CreateShortcut((Resolve-Path .).Path + "\.ai-sessions\active\current.lnk")
                        $shortcut.TargetPath = $latest.FullName
                        $shortcut.Save()
                        Write-Output "   ✅ 已创建 current.lnk"
                        $fixed++
                    }
                }
                
                "*指向不存在的文件*" {
                    $latest = Get-ChildItem ".ai-sessions/active/session-*.md" -ErrorAction SilentlyContinue | 
                              Sort-Object LastWriteTime -Descending | 
                              Select-Object -First 1
                    if ($latest) {
                        Remove-Item ".ai-sessions/active/current.lnk" -Force
                        $WshShell = New-Object -ComObject WScript.Shell
                        $shortcut = $WshShell.CreateShortcut((Resolve-Path .).Path + "\.ai-sessions\active\current.lnk")
                        $shortcut.TargetPath = $latest.FullName
                        $shortcut.Save()
                        Write-Output "   ✅ 已更新 current.lnk"
                        $fixed++
                    }
                }
                
                default {
                    Write-Output "   ⚠️  自动修复未实现，请手动处理"
                    Write-Output "      建议: $($issue.Fix)"
                    $failed++
                }
            }
        } catch {
            Write-Output "   ❌ 修复失败: $_"
            $failed++
        }
    }
    
    return @{ Fixed = $fixed; Failed = $failed }
}

# ==================== 主流程 ====================

Write-Output "🔍 V.A.R.C. v2.0 健康检查"
Write-Output "================================================"
Write-Output ""

$allIssues = @()

# 执行各项检查
Write-Output "📁 检查目录结构..."
$allIssues += Test-DirectoryStructure

Write-Output "⚙️  检查配置文件..."
$allIssues += Test-ConfigFile

Write-Output "📝 检查会话文件..."
$allIssues += Test-SessionFiles -CheckAll:$Full

Write-Output "🔗 检查 current 链接..."
$allIssues += Test-CurrentLink

Write-Output "⛓️ 检查会话链..."
$allIssues += Test-ChainContinuity

Write-Output "🔧 检查 Git 集成..."
$allIssues += Test-GitIntegration

# 输出检查结果
Write-Output ""
Write-Output "================================================"
Write-Output "📊 检查结果"
Write-Output "================================================"

if ($allIssues.Count -eq 0) {
    Write-Output "✅ 所有检查通过！"
} else {
    $errors = $allIssues | Where-Object { $_.Severity -eq "ERROR" }
    $warnings = $allIssues | Where-Object { $_.Severity -eq "WARNING" }
    $infos = $allIssues | Where-Object { $_.Severity -eq "INFO" }
    
    if ($errors.Count -gt 0) {
        Write-Output ""
        Write-Output "❌ 错误 ($($errors.Count)):"
        foreach ($e in $errors) { Write-Output "   - $($e.Message)" }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Output ""
        Write-Output "⚠️  警告 ($($warnings.Count)):"
        foreach ($w in $warnings) { Write-Output "   - $($w.Message)" }
    }
    
    if ($infos.Count -gt 0) {
        Write-Output ""
        Write-Output "ℹ️  信息 ($($infos.Count)):"
        foreach ($i in $infos) { Write-Output "   - $($i.Message)" }
    }
    
    # 自动修复
    if ($Fix) {
        Write-Output ""
        Write-Output "================================================"
        Write-Output "🔧 自动修复"
        Write-Output "================================================"
        
        $results = Invoke-Fixes -Issues $allIssues
        
        Write-Output ""
        Write-Output "✅ 已修复: $($results.Fixed) 个问题"
        if ($results.Failed -gt 0) {
            Write-Output "❌ 修复失败: $($results.Failed) 个问题"
        }
    } else {
        Write-Output ""
        Write-Output "💡 提示: 运行 .\varc-doctor.ps1 -Fix 自动修复可修复的问题"
    }
}

Write-Output ""
Write-Output "================================================"
Write-Output "检查完成"
