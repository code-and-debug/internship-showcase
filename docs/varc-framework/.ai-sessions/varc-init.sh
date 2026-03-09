#!/bin/bash
# V.A.R.C. 框架初始化脚本 (Linux/Mac 版本)
# 用法: ./varc-init.sh -p "my-project"

set -e

VARC_VERSION="1.0.0"
PROJECT_NAME=""
TEMPLATE="default"
SKIP_GIT=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project-name)
            PROJECT_NAME="$2"
            shift 2
            ;;
        -t|--template)
            TEMPLATE="$2"
            shift 2
            ;;
        --skip-git)
            SKIP_GIT=true
            shift
            ;;
        *)
            echo "未知参数: $1"
            exit 1
            ;;
    esac
done

if [ -z "$PROJECT_NAME" ]; then
    echo "❌ 请提供项目名称: ./varc-init.sh -p 'my-project'"
    exit 1
fi

echo "🚀 V.A.R.C. Framework v$VARC_VERSION - 初始化向导"
echo "================================================"

# 1. 创建目录结构
echo "📁 创建目录结构..."
mkdir -p .ai-sessions/{active,archive,chains,recovery,templates}
echo "  ✓ 目录结构创建完成"

# 2. 复制模板文件
echo "📋 创建模板文件..."

# Session 模板
SESSION_TEMPLATE="---
session_id: \"sess_$(date +%Y%m%d)_01_$(cat /dev/urandom | tr -dc 'a-z0-9' | head -c 8)\"
parent_session: null
context_engine: \"Claude-3.5-Sonnet\"
context_usage: 
  current: 0%
  limit: 200000
  remaining_tokens: 200000
status: \"active\"
checkpoint_reason: \"会话初始化\"
code_hash: \"$(git rev-parse HEAD 2>/dev/null || echo 'N/A')\"
test_status: \"PENDING\"
verification_command: \"npm test\"
recovery_priority: \"normal\"
rollback_target: \"git:HEAD\"
---

# $PROJECT_NAME - 初始会话

## 1. 不可变约束 (Immutable Constraints)
- [ ] **架构约束**: [待填写]
- [ ] **性能约束**: [待填写]
- [ ] **安全约束**: [待填写]
- [ ] **依赖约束**: [待填写]

## 2. 当前状态
### 2.1 代码状态
\`\`\`diff
# 初始状态
\`\`\`

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
\`\`\`typescript
// 待填写
\`\`\`

### 4.2 测试用例
\`\`\`typescript
// 待填写
\`\`\`

---
**创建时间**: $(date '+%Y-%m-%d %H:%M')  
**创建者**: $(whoami)  
"

SESSION_FILE=".ai-sessions/active/session-$(date +%Y%m%d)-01-init.md"
echo "$SESSION_TEMPLATE" > "$SESSION_FILE"
echo "  ✓ 创建初始会话: $SESSION_FILE"

# 3. 创建配置文件
if [ ! -f ".varc-config.yml" ]; then
    echo "⚙️  创建配置文件..."
    cat > .varc-config.yml << EOF
# V.A.R.C. 框架配置
version: "$VARC_VERSION"

project:
  name: "$PROJECT_NAME"
  template: "$TEMPLATE"
  created_at: "$(date '+%Y-%m-%d %H:%M:%S')"

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
EOF
    echo "  ✓ 创建 .varc-config.yml"
fi

# 4. 创建 .gitignore
if [ ! -f ".gitignore" ] || ! grep -q "V.A.R.C." .gitignore 2>/dev/null; then
    echo "📝 更新 .gitignore..."
    cat >> .gitignore << 'EOF'

# V.A.R.C. Framework
.ai-sessions/archive/
.ai-sessions/active/*.tmp
.ai-sessions/recovery/*.log
.varc-local.yml
EOF
    echo "  ✓ 更新 .gitignore"
fi

# 5. 创建 current 软链接
if [ -f "$SESSION_FILE" ]; then
    cd .ai-sessions/active
    ln -sf "$(basename "$SESSION_FILE")" current 2>/dev/null || true
    cd ../..
    echo "  ✓ 设置当前会话指针"
fi

# 6. 输出完成信息
echo ""
echo "✅ V.A.R.C. 框架初始化完成!"
echo "================================================"
echo ""
echo "项目: $PROJECT_NAME"
echo "当前会话: $(basename "$SESSION_FILE")"
echo ""
echo "📖 下一步:"
echo "  1. 编辑 .varc-config.yml 配置验证命令"
echo "  2. 编辑当前会话文件填写不可变约束"
echo "  3. 运行 ./varc-save.sh 保存会话进度"
echo ""
echo "💡 常用命令:"
echo "  ./varc-save.sh -r '上下文达70%'    # 保存会话"
echo "  ./varc-fork.sh -p [session-id]      # 分叉新会话"
echo "  ./varc-status.sh                    # 查看状态"
echo ""
