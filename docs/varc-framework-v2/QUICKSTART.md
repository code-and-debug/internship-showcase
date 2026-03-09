# V.A.R.C. v2.0 快速开始指南

> 5分钟从零到全自动

---

## 第一步：安装（30秒）

```powershell
# 1. 复制到你的项目根目录
xcopy /E /I /Y docs\varc-framework-v2 .varc

# 2. 进入目录
cd .varc

# 3. 初始化（全自动配置）
.\scripts\varc-init-v2.ps1 -AutoConfigure
```

**初始化会自动完成：**
- ✅ 创建 `.ai-sessions/` 目录结构
- ✅ 安装 Git 钩子（自动保存）
- ✅ 配置快捷命令别名

---

## 第二步：使用（2种模式）

### 模式 A：全自动（推荐）

```powershell
# 启动守护模式（后台自动保存）
.\scripts\varc-auto.ps1 -Mode daemon
```

**自动触发保存的场景：**
- 每次 `git commit` 时
- 每 10 分钟（可配置）
- 保存测试文件时

### 模式 B：一键手动

```powershell
# 一键保存（无需参数，智能推断）
.\scripts\varc-quick-save.ps1

# 输出示例：
# ✅ 已自动保存会话
# 📋 推断原因: "feat: 添加用户登录功能" (来自 git commit)
# 🧪 测试状态: PASS
# 💾 会话 ID: sess_20240309_03_a7b3d9
```

---

## 第三步：上下文耗尽时

```powershell
# 一键生成分叉提示词（自动复制到剪贴板）
.\scripts\varc-fork-v2.ps1 -AutoCopy

# 输出：
# ✅ 已生成恢复提示词
# 📋 已复制到剪贴板
# 📝 会话 ID: sess_20240309_04_f8e2c5
# 
# 💡 下一步：直接粘贴到新对话框即可
```

**然后：**
1. 打开新的 AI 对话框
2. `Ctrl+V` 粘贴
3. AI 自动理解上下文，继续工作

---

## 常用命令速查

| 命令 | 作用 | 频率 |
|-----|------|------|
| `varc-quick-save` | 一键保存当前状态 | 随时 |
| `varc-fork-v2 -AutoCopy` | 生成分叉提示词 | 上下文耗尽时 |
| `varc-doctor` | 健康检查 | 每周 |
| `varc-report` | 查看统计 | 每月 |

---

## 健康检查

```powershell
# 检查框架状态
.\scripts\varc-doctor.ps1

# 自动修复问题
.\scripts\varc-doctor.ps1 -Fix
```

---

**遇到问题？** 运行 `varc-doctor -Fix` 自动修复大部分问题。
