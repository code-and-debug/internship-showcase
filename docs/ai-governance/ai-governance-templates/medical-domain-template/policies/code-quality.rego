# Medical AI Governance - Code Quality Policies

package medical_ai.quality

# 函数复杂度过高
violation[{"id": "QUAL-001", "severity": "medium", "message": msg}] {
    input.cyclomatic_complexity > 10
    msg := sprintf("函数 '%s' 圈复杂度 %d 超过医疗软件标准(10)", [input.function_name, input.cyclomatic_complexity])
}

# 嵌套层级过深
violation[{"id": "QUAL-002", "severity": "medium", "message": msg}] {
    input.nesting_depth > 3
    msg := sprintf("函数 '%s' 嵌套层级 %d 超过标准(3)", [input.function_name, input.nesting_depth])
}

# 医疗计算必须有单元测试
violation[{"id": "QUAL-003", "severity": "high", "message": msg}] {
    input.domain == "medical"
    input.function_type == "calculation"
    not input.has_unit_test
    msg := sprintf("医疗计算函数 '%s' 必须有对应的单元测试", [input.function_name])
}

# 禁用eval和危险函数
violation[{"id": "QUAL-004", "severity": "critical", "message": msg}] {
    regex.match(`\b(eval|Function\s*\()\s*\(`, input.content)
    msg := "医疗软件禁止使用eval/new Function等动态执行"
}

# TypeScript strict mode检查
violation[{"id": "QUAL-005", "severity": "high", "message": msg}] {
    input.language == "typescript"
    input.any_type_count > 0
    msg := sprintf("发现 %d 个 'any' 类型使用，医疗软件要求100%类型覆盖", [input.any_type_count])
}
