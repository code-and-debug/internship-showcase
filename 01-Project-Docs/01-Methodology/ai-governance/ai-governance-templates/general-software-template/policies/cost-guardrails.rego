# General Software AI Governance - Cost Guardrails

package general_ai.cost

# Token使用限制
warn[{"id": "COST-W001", "severity": "medium", "message": msg}] {
    input.tokens_used > 4000
    input.tokens_used <= 8000
    msg := sprintf("单次生成使用 %d tokens，建议优化prompt", [input.tokens_used])
}

deny[{"id": "COST-001", "severity": "high", "message": msg}] {
    input.tokens_used > 8000
    msg := sprintf("单次生成使用 %d tokens，必须优化", [input.tokens_used])
}

# 模型使用策略
warn[{"id": "COST-W002", "severity": "low", "message": msg}] {
    input.model in ["gpt-4", "gpt-4-turbo", "claude-3-opus"]
    input.estimated_complexity == "low"
    msg := sprintf("使用 %s 模型处理简单任务，建议降级到gpt-3.5-turbo", [input.model])
}

# 成本预算
deny[{"id": "COST-002", "severity": "high", "message": msg}] {
    input.daily_cost > input.daily_budget
    msg := sprintf("今日AI调用成本 $%.2f 超过预算 $%.2f", [input.daily_cost, input.daily_budget])
}

# 缓存建议
warn[{"id": "COST-W003", "severity": "low", "message": msg}] {
    input.cache_enabled == false
    input.similar_request_count > 3
    msg := "相同输入重复调用AI，建议启用响应缓存"
}
