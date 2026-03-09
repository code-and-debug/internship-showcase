#!/bin/bash
# V.A.R.C. 框架 - 会话保存脚本 (Linux/Mac 版本)
# 用法: ./varc-save.sh -r "上下文达70%" [-s checkpointed|completed|failed]

set -e

REASON=""
STATUS="checkpointed"
PRIORITY="normal"
SKIP_VERIFICATION=false
SKIP_GIT=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--reason)
            REASON="$2"
            shift 2
            ;;
        -s|--status)
            STATUS="$2"
            shift 2
            ;;
        -p|--priority)
            PRIORITY="$2"
            shift 2
            ;;
        --skip-verification)
            SKIP_VERIFICATION=true
            shift
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

if [ -z "$REASON" ]; then
    echo "❌ 请提供保存原因: ./varc-save.sh -r '描述'"
    exit 1
fi

echo "💾 保存会话"
echo "================================================"

# 获取当前会话
CURRENT_LINK=".ai-sessions/active/current"
CURRENT_SESSION=""

if [ -L "$CURRENT_LINK" ]; then
    CURRENT_SESSION=$(readlink "$CURRENT_LINK")
    CURRENT_SESSION=".ai-sessions/active/$CURRENT_SESSION"
fi

if [ -z "$CURRENT_SESSION" ] || [ ! -f "$CURRENT_SESSION" ]; then
    echo "⚠️  没有找到当前会话，请先运行初始化"
    exit 1
fi

echo "会话: $(basename "$CURRENT_SESSION")"

# 获取 Git 状态
echo "📋 收集元数据..."
GIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "N/A")
echo "  ✓ Git commit: $GIT_HASH"

# 运行验证
if [ "$SKIP_VERIFICATION" = false ]; then
    read -p "测试状态 (PASS/FAIL/PENDING): " TEST_STATUS
else
    TEST_STATUS="PENDING"
fi

# 更新文件内容
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
sed -i.bak "s/status: \"[^\"]*\"/status: \"$STATUS\"/" "$CURRENT_SESSION"
sed -i.bak "s/checkpoint_reason: \"[^\"]*\"/checkpoint_reason: \"$REASON\"/" "$CURRENT_SESSION"
sed -i.bak "s/test_status: \"[^\"]*\"/test_status: \"$TEST_STATUS\"/" "$CURRENT_SESSION"
sed -i.bak "s/code_hash: \"[^\"]*\"/code_hash: \"sha256:$GIT_HASH\"/" "$CURRENT_SESSION"
sed -i.bak "s/recovery_priority: \"[^\"]*\"/recovery_priority: \"$PRIORITY\"/" "$CURRENT_SESSION"
sed -i.bak "s/\*\*保存时间\*\*: .*/\*\*保存时间\*\*: $TIMESTAMP/" "$CURRENT_SESSION"
rm -f "$CURRENT_SESSION.bak"

echo "  ✓ 更新会话文件"

# Git 提交
if [ "$SKIP_GIT" = false ] && [ -d ".git" ]; then
    read -p "是否提交到 Git? (y/n): " SHOULD_COMMIT
    if [ "$SHOULD_COMMIT" = "y" ]; then
        git add -A
        COMMIT_MSG="[VARC] $(basename "$CURRENT_SESSION" .md) - $REASON"
        git commit -m "$COMMIT_MSG"
        echo "  ✓ Git 提交: $COMMIT_MSG"
    fi
fi

# 归档（如果完成）
if [ "$STATUS" = "completed" ]; then
    ARCHIVE_DIR=".ai-sessions/archive/$(date +%Y-%m)"
    mkdir -p "$ARCHIVE_DIR"
    mv "$CURRENT_SESSION" "$ARCHIVE_DIR/"
    echo "  ✓ 归档到: $ARCHIVE_DIR"
fi

echo ""
echo "✅ 会话保存完成!"
echo "================================================"
