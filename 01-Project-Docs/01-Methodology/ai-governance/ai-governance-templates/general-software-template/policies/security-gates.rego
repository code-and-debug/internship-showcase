# General Software AI Governance - Security Gates

package general_ai.security

# 严重违规 (阻止部署)
deny[{"id": "SEC-001", "severity": "critical", "message": msg}] {
    regex.match(`\b(eval|Function\s*\()\s*\(`, input.content)
    msg := "检测到动态代码执行，存在代码注入风险"
}

deny[{"id": "SEC-002", "severity": "critical", "message": msg}] {
    regex.match(`["\'](sk-|AKIA|ghp_)[a-zA-Z0-9_]+["\']`, input.content)
    msg := "检测到硬编码密钥"
}

deny[{"id": "SEC-003", "severity": "critical", "message": msg}] {
    regex.match(`["']+.*SELECT.*\+.*\$\{`, input.content)
    msg := "字符串拼接SQL查询，必须使用参数化查询"
}

# 高优先级警告
warn[{"id": "SEC-W001", "severity": "high", "message": msg}] {
    regex.match(`(app\.(get|post|put|delete))`, input.content)
    not regex.match(`(zod|joi|class-validator)`, input.content)
    msg := "API端点缺少输入验证逻辑"
}

# 代码质量规则
warn[{"id": "QUAL-W001", "severity": "medium", "message": msg}] {
    input.lines > 50
    input.lines <= 100
    msg := sprintf("函数 %s 有 %d 行，建议拆分", [input.function_name, input.lines])
}

deny[{"id": "QUAL-001", "severity": "medium", "message": msg}] {
    input.lines > 100
    msg := sprintf("函数 %s 有 %d 行，必须重构", [input.function_name, input.lines])
}

warn[{"id": "QUAL-W002", "severity": "medium", "message": msg}] {
    input.cyclomatic_complexity > 10
    input.cyclomatic_complexity <= 20
    msg := sprintf("函数 %s 圈复杂度 %d，建议简化", [input.function_name, input.cyclomatic_complexity])
}

# TypeScript最佳实践
warn[{"id": "TS-W001", "severity": "low", "message": msg}] {
    input.language == "typescript"
    input.any_type_count > 0
    input.any_type_count <= 5
    msg := sprintf("发现 %d 个any类型使用", [input.any_type_count])
}

# 决策函数
allow := true { count(deny) == 0 }

report := {
    "allow": allow,
    "deny": deny,
    "warn": warn,
    "deny_count": count(deny),
    "warn_count": count(warn),
}
