# Memo Platform · 前端

备忘录平台的前端项目，基于 **React 18 + Vite + TypeScript**。

## 功能

- 游客模式：无需登录即可浏览「公开」备忘
- 登录 / 注册（账号密码 + JWT）
- 登录后可新建 / 编辑 / 删除备忘
- 备忘可见性：公开（所有人可见）/ 私有（仅作者本人可见）

## 技术栈

- React 18 + TypeScript
- Vite 5（开发服务器 + 构建）
- 原生 `fetch` 对接后端 REST API

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产包
npm run build
```

## 与后端联调

开发环境通过 Vite 代理把 `/api/*` 请求转发到后端 `http://127.0.0.1:8000`（见 `vite.config.ts`）。

请先启动后端 `memo-backend`，再启动前端，即可完整体验「游客浏览公开备忘 → 登录 → 管理私有备忘」的流程。

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
    └── MemoEditor.tsx  # 新建 / 编辑表单
```
