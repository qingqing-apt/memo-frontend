# Memo Platform · 前端

备忘录平台的前端项目，基于 **React 18 + Vite + TypeScript**。

## 功能

- 游客模式：无需登录即可浏览「公开」备忘
- 登录 / 注册（账号密码 + JWT）
- 登录后可新建 / 编辑 / 删除备忘
- 备忘可见性：公开（所有人可见）/ 私有（仅作者本人可见）
- **备忘 Agent**（第三天新增）：登录后右下角出现「备忘助手」，可对话查询自己的备忘录

## 技术栈

- React 18 + TypeScript
- Vite 5（开发服务器 + 构建）
- 原生 `fetch` 对接后端 REST API
- CopilotKit（Agent 聊天 UI）+ CopilotKit Runtime（Node Express）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产包
npm run build
```

## 备忘 Agent（第三天）

备忘 Agent 采用 CopilotKit 三层架构：**前端 → Runtime → Python Agent**。

```text
浏览器 (React + CopilotKit)
  → Vite 代理 /api/copilotkit
    → CopilotKit Runtime (Node Express, localhost:3000)
      → HttpAgent (AG-UI)
        → Python /agent (memo-backend, Agent Framework + DeepSeek)
```

### 启动 Agent（三个服务）

```bash
# 1. Python 后端（memo-backend，端口 8000）
uvicorn app.main:app --reload --port 8000

# 2. CopilotKit Runtime（本仓库，端口 3000）
npm run runtime

# 3. 前端开发服务器（端口 5173）
npm run dev
```

### 认证与安全

- 前端登录后，JWT 通过 `headers.authorization` 传给 Runtime；Runtime 默认转发 `authorization` header 给 HttpAgent → Python `/agent`
- Python 后端校验 JWT，未登录 / 无效 token 返回 401（在运行模型前拒绝）
- Agent 工具只读取后端从 JWT 解析出的 user_id，模型与浏览器都无法指定用户
- Agent 仅在登录后渲染（`user && <AgentChat/>`），后端鉴权兜底

### 实际版本

- `@copilotkit/react-core` 1.83.0、`@copilotkit/runtime` 1.83.0、`@ag-ui/client` 1.0.3
- Runtime 用 `@copilotkit/runtime/v2` + `createCopilotExpressHandler`（Express 5）

## 与后端联调

开发环境通过 Vite 代理转发请求（见 `vite.config.ts`）：
- `/api/copilotkit` → CopilotKit Runtime（`localhost:3000`）
- `/api/*` → 后端（`http://127.0.0.1:8000`，去掉 `/api` 前缀）

## 目录结构

```
src/
├── main.tsx            # 入口
├── App.tsx             # 全局布局与登录态管理
├── api.ts              # 后端 API 封装（含 JWT 头注入）
├── types.ts            # 类型定义
├── styles.css          # 全局样式
└── components/
    ├── AuthModal.tsx   # 登录 / 注册弹窗
    ├── MemoBoard.tsx   # 备忘列表
    ├── MemoEditor.tsx  # 新建 / 编辑表单
    └── AgentChat.tsx   # 备忘 Agent（CopilotKit Provider + Popup）

runtime/
└── server.ts           # CopilotKit Runtime（Express + HttpAgent）
```
