# Medical AI Governance - HIPAA Compliance Policies

package medical_ai.hipaa

# 禁止硬编码患者ID
violation[{"id": "HIPAA-001", "severity": "critical", "message": msg}] {
    input.file_type == "typescript"
    regex.match(`patient[_-]?id["']?\s*[:=]\s*["']?\d+`, input.content)
    msg := "AI生成代码包含硬编码患者ID，违反HIPAA隐私规则"
}

# 禁止硬编码SSN
violation[{"id": "HIPAA-002", "severity": "critical", "message": msg}] {
    regex.match(`\b\d{3}-\d{2}-\d{4}\b`, input.content)
    msg := "检测到硬编码SSN，严重违反HIPAA"
}

# 禁止记录敏感信息到日志
violation[{"id": "HIPAA-003", "severity": "high", "message": msg}] {
    regex.match(`console\.(log|warn|error)\s*\(.*?(password|ssn|patient)`, input.content)
    msg := "日志记录包含潜在PHI数据，必须脱敏处理"
}

# 关键函数必须添加MEDICAL_REVIEW_REQUIRED标签
violation[{"id": "HIPAA-004", "severity": "high", "message": msg}] {
    input.function_risk == "critical"
    not input.metadata.tags[_] == "MEDICAL_REVIEW_REQUIRED"
    msg := sprintf("函数 '%s' 处理关键医疗数据，必须添加@MEDICAL_REVIEW_REQUIRED标签", [input.function_name])
}

# 数据库查询必须使用参数化查询
violation[{"id": "HIPAA-005", "severity": "critical", "message": msg}] {
    input.database_access == true
    regex.match(`["']+.*SELECT.*\+.*\$\{`, input.content)
    msg := "检测到字符串拼接SQL，必须使用参数化查询防止SQL注入"
}

# 决策函数
allow := true { count(violation) == 0 }

deny[msg] {
    some v in violation
    v.severity == "critical"
    msg := sprintf("[CRITICAL] %s: %s", [v.id, v.message])
}
