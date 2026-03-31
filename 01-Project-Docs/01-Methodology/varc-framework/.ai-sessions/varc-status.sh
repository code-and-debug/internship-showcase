#!/bin/bash
# V.A.R.C. 框架 - 状态查看脚本 (Linux/Mac 版本)
# 用法: ./varc-status.sh

echo "📊 V.A.R.C. 框架状态"
echo "================================================"
echo ""

# 配置信息
if [ -f ".varc-config.yml" ]; then
    echo "📋 项目信息"
    echo "------------------------------------------------"
    grep -E "^\s*(name|version):" .varc-config.yml | head -2 | sed 's/^[[:space:]]*/  /'
    echo ""
fi

# 当前会话
echo "📝 当前会话"
echo "------------------------------------------------"

if [ -L ".ai-sessions/active/current" ]; then
    CURRENT=$(readlink ".ai-sessions/active/current")
    if [ -f ".ai-sessions/active/$CURRENT" ]; then
        echo "会话: $CURRENT"
        grep -E "^session_id:|^status:|^checkpoint_reason:" ".ai-sessions/active/$CURRENT" | sed 's/^[[:space:]]*/  /'
    else
        echo "  ⚠️  当前指针指向不存在的文件"
    fi
else
    # 列出最近的会话
    LATEST=$(ls -t .ai-sessions/active/session-*.md 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
        echo "  当前无活动指针，最近会话:"
        ls -lt .ai-sessions/active/session-*.md 2>/dev/null | head -3 | awk '{print "  - " $9 " (" $6 " " $7 ")"}'
    else
        echo "  暂无活跃会话"
    fi
fi
echo ""

# 活跃会话列表
echo "📁 活跃会话"
echo "------------------------------------------------"
COUNT=$(ls -1 .ai-sessions/active/session-*.md 2>/dev/null | wc -l)
if [ "$COUNT" -gt 0 ]; then
    ls -lt .ai-sessions/active/session-*.md 2>/dev/null | head -5 | awk '{print "  " $9 " (" $6 " " $7 ")"}'
    if [ "$COUNT" -gt 5 ]; then
        echo "  ... 还有 $((COUNT - 5)) 个会话"
    fi
else
    echo "  无活跃会话"
fi
echo ""

# 会话链
echo "🔗 会话链"
echo "------------------------------------------------"
CHAIN_COUNT=$(ls -1 .ai-sessions/chains/chain-*.json 2>/dev/null | wc -l)
if [ "$CHAIN_COUNT" -gt 0 ]; then
    for chain in .ai-sessions/chains/chain-*.json; do
        if [ -f "$chain" ]; then
            CHAIN_ID=$(basename "$chain" .json | sed 's/chain-//')
            echo "  - $CHAIN_ID"
        fi
    done
else
    echo "  无会话链"
fi
echo ""

# 归档统计
echo "📦 归档"
echo "------------------------------------------------"
ARCHIVE_DIRS=$(find .ai-sessions/archive -type d -name "[0-9][0-9][0-9][0-9]-[0-9][0-9]" 2>/dev/null | wc -l)
if [ "$ARCHIVE_DIRS" -gt 0 ]; then
    for dir in .ai-sessions/archive/[0-9][0-9][0-9][0-9]-[0-9][0-9]; do
        if [ -d "$dir" ]; then
            ARCHIVE_COUNT=$(ls -1 "$dir"/*.md 2>/dev/null | wc -l)
            echo "  $(basename "$dir"): $ARCHIVE_COUNT 个会话"
        fi
    done
else
    echo "  无归档会话"
fi
echo ""

# 快速操作提示
echo "💡 快速操作"
echo "------------------------------------------------"
echo "  ./varc-save.sh -r '描述'       # 保存当前会话"
echo "  ./varc-fork.sh -p [ID] -r '原因'  # 分叉新会话"
echo "  ./varc-init.sh -p [name]       # 重新初始化"
echo ""
