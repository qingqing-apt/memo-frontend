import { useMemo } from "react";
import { CopilotKit, CopilotPopup } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { getToken } from "../api";

export default function AgentChat() {
  // 登录 token 通过 Authorization header 传给 Runtime，再由 Runtime 转发给 Python /agent
  const token = getToken();
  const headers: Record<string, string> = useMemo(() => {
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="memo_agent"
      headers={headers}
      useSingleEndpoint={false}
    >
      <CopilotPopup
        labels={{
          chatInputPlaceholder: '问问我你的备忘录，比如「我有哪些备忘？」',
        }}
      />
    </CopilotKit>
  );
}
