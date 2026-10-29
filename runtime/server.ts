import express from "express";
import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { createCopilotExpressHandler } from "@copilotkit/runtime/v2/express";
import { HttpAgent } from "@ag-ui/client";

// Python 后端的 AG-UI 端点（Agent Framework + DeepSeek）
const AGENT_URL = process.env.AGENT_URL || "http://127.0.0.1:8000/agent";
const PORT = Number(process.env.COPILOT_RUNTIME_PORT || 3000);

// 从 Authorization header 提取用户身份（只做 base64 解码取 sub=username，用于线程隔离；
// 真正的签名校验由 Python 后端 /agent 完成，这里不信任也不依赖前端传的用户 id）。
function getUserId(request: Request): string | null {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof decoded.sub === "string" ? decoded.sub : token;
  } catch {
    return token;
  }
}

const runtime = new CopilotRuntime({
  agents: {
    // 前端 <CopilotKit agent="memo_agent"> 通过这个标识找到后端 Agent
    memo_agent: new HttpAgent({ url: AGENT_URL }),
  },
  runner: new InMemoryAgentRunner(),
  // 按登录用户隔离线程（列表/清空各自独立，不串历史）
  identifyUser: (request) => {
    const id = getUserId(request);
    if (!id) return null;
    return { id, name: id };
  },
});

const app = express();
// basePath 已包含在 handler 内部，直接 use 即可
app.use(createCopilotExpressHandler({ runtime, basePath: "/api/copilotkit" }));

app.listen(PORT, () => {
  console.log(`CopilotKit Runtime: http://localhost:${PORT}/api/copilotkit`);
  console.log(`  -> forwards to agent: ${AGENT_URL}`);
});
