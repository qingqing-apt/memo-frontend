import { useEffect, useMemo, useState } from "react";
import { CopilotKit, CopilotPopup } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { getToken } from "../api";

type AgentErrorInfo = { message: string; hint: string } | null;

/**
 * 备忘助手入口。
 *
 * 除了渲染 CopilotKit 聊天面板，还额外做一层**失败兜底**：
 * CopilotKit v2 没有暴露会话级错误回调（类型定义里没有公开 onError），
 * 当 Runtime / 后端不可用时，界面会「只有用户消息、没有任何回应」，用户无法判断是卡住还是出错。
 * 这里拦截发往 Runtime 的请求，把失败翻译成可读提示，并提供重试入口。
 */
export default function AgentChat() {
  // 登录 token 通过 Authorization header 传给 Runtime，再由 Runtime 转发给 Python /agent
  const token = getToken();
  const headers: Record<string, string> = useMemo(() => {
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [agentError, setAgentError] = useState<AgentErrorInfo>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalFetch = window.fetch.bind(window);

    const isAgentRequest = (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      return url.includes("/api/copilotkit");
    };

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!isAgentRequest(input)) return originalFetch(input, init);
      try {
        const response = await originalFetch(input, init);
        if (response.status === 401) {
          setAgentError({
            message: "登录状态已失效，助手无法访问你的备忘录。",
            hint: "请退出后重新登录再试。",
          });
        } else if (response.status >= 500) {
          setAgentError({
            message: `备忘助手服务暂时不可用（HTTP ${response.status}）。`,
            hint: "可能是 Runtime 或后端未启动，请稍后重试。",
          });
        } else if (response.ok) {
          setAgentError(null);
        }
        return response;
      } catch (error) {
        setAgentError({
          message: "无法连接备忘助手服务，消息未发送成功。",
          hint: "请确认 Runtime（:3000）与后端（:8000）已启动，然后重试。",
        });
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        agent="memo_agent"
        headers={headers}
        useSingleEndpoint={false}
      >
        <CopilotPopup
          labels={{
            chatInputPlaceholder: "问问我你的备忘录，比如「我有哪些备忘？」",
          }}
        />
      </CopilotKit>

      {agentError && (
        <div className="agent-error" role="alert">
          <div className="agent-error__body">
            <strong>{agentError.message}</strong>
            <span>{agentError.hint}</span>
          </div>
          <button
            type="button"
            className="agent-error__close"
            onClick={() => setAgentError(null)}
            aria-label="关闭提示"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
