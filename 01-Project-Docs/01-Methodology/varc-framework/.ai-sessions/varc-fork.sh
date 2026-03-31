#!/bin/bash
# V.A.R.C. 框架 - 会话分叉脚本 (Linux/Mac 版本)
# 用法: ./varc-fork.sh -p [session-id] -r "上下文耗尽"

set -e

PARENT=""
REASON=""
CHAIN_ID=""

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--parent)
            PARENT="$2"
            shift 2
            ;;
        -r|--reason)
            REASON="$2"
            shift 2
            ;;
        -c|--chain)
            CHAIN_ID="$2"
            shift 2
            ;;
        *)
            echo "未知参数: $1"
            exit 1
            ;;
    esac
done

if [ -z "$PARENT" ] || [ -z "$REASON" ]; then
    echo "❌ 用法: ./varc-fork.sh -p [session-id] -r '原因'"
    exit 1
fi

echo "🌿 分叉新会话"
echo "================================================"

# 查找父会话
PARENT_SESSION=""
SEARCH_PATHS=(
    ".ai-sessions/active/$PARENT.md"
    ".ai-sessions/active/$PARENT"
    ".ai-sessions/archive/*/$PARENT.md"
)

for path in "${SEARCH_PATHS[@]}"; do
    if [ -f "$path" ]; then
        PARENT_SESSION="$path"
        break
    fi
done

if [ -z "$PARENT_SESSION" ]; then
    echo "❌ 找不到父会话: $PARENT"
    exit 1
fi

echo "父会话: $(basename "$PARENT_SESSION")"

# 生成新会话 ID
TODAY=$(date +%Y%m%d)
EXISTING_COUNT=$(ls -1 .ai-sessions/active/session-${TODAY}-*.md 2>/dev/null | wc -l)
NEXT_NUM=$((EXISTING_COUNT + 1))
NEXT_NUM_PADDED=$(printf "%02d" $NEXT_NUM)
RANDOM_HASH=$(cat /dev/urandom | tr -dc 'a-z0-9' | head -c 8)

SESSION_ID="sess_${TODAY}_${NEXT_NUM_PADDED}_${RANDOM_HASH}"
NEW_SESSION_FILE=".ai-sessions/active/session-${TODAY}-${NEXT_NUM_PADDED}-${RANDOM_HASH}.md"

echo "新会话: $(basename "$NEW_SESSION_FILE")"

# 提取父会话的关键信息
PARENT_CONTENT=$(cat "$PARENT_SESSION")

# 生成新会话内容
cat > "$NEW_SESSION_FILE" << EOF
---
session_id: "$SESSION_ID"
parent_session: "$PARENT"
context_engine: "Claude-3.5-Sonnet"
context_usage: 
  current: 0%
  limit: 200000
  remaining_tokens: 200000
status: "active"
checkpoint_reason: "$REASON"
code_hash: "$(git rev-parse HEAD 2>/dev/null || echo 'N/A')"
test_status: "PENDING"
verification_command: "npm test"
recovery_priority: "normal"
rollback_target: "git:HEAD"
---

# 从 $PARENT 分叉的新会话

## 1. 继承的约束 (Inherited Constraints)
$(echo "$PARENT_CONTENT" | grep -A 20 "## 1. 不可变约束" | tail -n +2)

## 2. 当前状态
### 2.1 代码状态
\`\`\`diff
# 继承自父会话
\`\`\`

### 2.2 思维状态
- **继承**: 从父会话延续
- **本会话目标**: [待填写]

### 2.3 阻塞点
待更新

## 3. 关键决策日志
| 时间 | 决策 | 理由 | 替代方案 | 决策者 |
|------|------|------|----------|--------|

## 4. 资源引用
### 4.1 代码片段
\`\`\`typescript
// 从父会话继承
\`\`\`

### 4.2 测试用例
\`\`\`typescript
// 待填写
\`\`\`

### 4.3 外部参考
- 父会话: $PARENT_SESSION

---

## 5. 续接指南
**分叉原因**: $REASON

### Step 1: 约束确认
确认理解上方第1节的不可变约束。

### Step 2: 状态验证
运行验证命令确认环境无误。

### Step 3: 继续工作
基于父会话状态继续当前任务。

---

**创建时间**: $(date '+%Y-%m-%d %H:%M')  
**创建者**: $(whoami)  
**分叉原因**: $REASON  
EOF

echo "  ✓ 创建新会话文件"

# 更新 current 软链接
ln -sf "$(basename "$NEW_SESSION_FILE")" .ai-sessions/active/current
echo "  ✓ 更新当前会话指针"

# 生成迁移提示词
echo ""
echo "📝 请复制以下内容到新对话框:"
echo "================================================"
echo ""
echo "[SYSTEM RESTORE PROTOCOL - V.A.R.C. Framework]"
echo ""
echo "你是该任务的接续AI。我们从检查点恢复会话。"
echo ""
echo "会话ID: $SESSION_ID"
echo "父会话: $PARENT"
echo "分叉原因: $REASON"
echo ""
echo "请先确认理解项目约束，然后列出当前目录结构验证环境。"
echo ""

echo ""
echo "✅ 分叉完成! 新会话: $(basename "$NEW_SESSION_FILE" .md)"
