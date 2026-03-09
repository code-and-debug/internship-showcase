# V.A.R.C. v2.0 极简使用示例

## 场景：从零开始使用 V.A.R.C.

### 1. 初始化（1分钟）

```powershell
# 复制框架到你的项目
xcopy /E /I /Y docs\varc-framework-v2 .varc
cd .varc

# 初始化
.\scripts\varc-init-v2.ps1 -AutoConfigure

# 输出：
# ✅ 目录结构已创建
# ✅ Git 钩子已安装
# ✅ 快捷命令已配置
# ✅ 初始会话已创建
```

### 2. 开始开发（全自动）

```powershell
# 启动守护模式（可选，推荐）
.\scripts\varc-auto.ps1 -Mode daemon

# 或者直接开始编码，每次 git commit 会自动保存
```

### 3. 日常开发循环

```powershell
# 编码中...

# 随时一键保存（如果你关闭了守护模式）
vs   # 或 .\scripts\varc-quick-save.ps1

# 输出：
# ✅ 会话已保存
# 📋 推断原因: "feat: 添加登录功能" (来自 git commit)
# 🧪 测试状态: PASS
# 💾 会话 ID: sess_20240309_03_a7b3d9
```

### 4. 上下文耗尽时

```powershell
# 当你感觉 AI 开始"失忆"时
vf   # 或 .\scripts\varc-fork-v2.ps1 -AutoCopy

# 输出：
# ✅ 已生成恢复提示词
# 📋 已复制到剪贴板
# 📝 会话 ID: sess_20240309_04_f8e2c5
# 💡 下一步：直接粘贴到新对话框即可
```

**然后：**
1. 打开新的 AI 对话框
2. `Ctrl+V` 粘贴
3. AI 自动理解上下文，继续工作

### 5. 每周健康检查

```powershell
vd   # 或 .\scripts\varc-doctor.ps1

# 输出：
# ✅ 目录结构正常
# ✅ 配置文件正常
# ✅ 会话文件格式正确
# ⚠️  发现 2 个会话缺少 test_status
# 💡 运行 vd -Fix 自动修复
```

### 6. 查看统计

```powershell
vr   # 或 .\scripts\varc-report.ps1

# 输出：
# 📊 V.A.R.C. 使用报告
# ─────────────────────────────
# 总会话数: 47
# 已完成: 32 (68%)
# 平均会话时长: 45分钟
# 复用成功率: 87%
```

---

## 快捷键速查表

| 命令 | 完整命令 | 作用 |
|-----|---------|------|
| `vs` | `varc-quick-save` | 一键保存 |
| `vf` | `varc-fork-v2 -AutoCopy` | 一键分叉 |
| `vd` | `varc-doctor` | 健康检查 |
| `vr` | `varc-report` | 查看统计 |
| `va` | `varc-auto -Mode daemon` | 启动守护模式 |

---

## 总结

**v2.0 的核心理念：让会话管理隐形**

- ✅ 启动守护模式后，基本无需手动操作
- ✅ 需要分叉时，一键完成
- ✅ 每周运行一次健康检查
- ✅ 其他时间专注编码
