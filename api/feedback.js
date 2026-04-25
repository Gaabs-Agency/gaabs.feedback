const RELEVANCE_BASE = "https://api-d7b62b.stack.tryrelevance.com/latest";
const RELEVANCE_AUTH = "d82ca31b-33c0-4b90-ab6b-5a42298cf982:sk-ZjYzMjA3YzQtZDYzMi00NWRmLTkyOTQtMjY4NzMwZTI2MzQy";
 
const TOOL_FEEDBACK_SUBMIT = "d7b62b/d82ca31b-33c0-4b90-ab6b-5a42298cf982/662205fe-5806-433a-9b35-142cc338291c";
const TOOL_SESSION_READ    = "d7b62b/d82ca31b-33c0-4b90-ab6b-5a42298cf982/28bb1d1e-e37e-4633-aaef-f563b112c192";
 
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
 
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
 
  const { action } = req.query;
 
  try {
 
    // ── GET SESSION ───────────────────────────────────────────────────
    if (action === "get_session") {
      const { token } = req.query;
 
      const resp = await fetch(
        `${RELEVANCE_BASE}/studios/${TOOL_SESSION_READ}/trigger_limited`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": RELEVANCE_AUTH
          },
          body: JSON.stringify({ params: { operation: "list_sessions" } })
        }
      );
 
      const data = await resp.json();
      const sessions = data?.output?.sessions || [];
      const session = sessions.find(s => s.client_token === token);
 
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
 
      return res.status(200).json(session);
    }
 
    // ── SUBMIT FEEDBACK ───────────────────────────────────────────────
    if (action === "submit_feedback") {
      const { client_token, keep_text, change_text, unclear_text } = req.body;
 
      if (!client_token) {
        return res.status(400).json({ error: "client_token missing" });
      }
 
      const resp = await fetch(
        `${RELEVANCE_BASE}/studios/${TOOL_FEEDBACK_SUBMIT}/trigger_limited`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": RELEVANCE_AUTH
          },
          body: JSON.stringify({
            params: {
              client_token,
              keep_text:    keep_text    || "",
              change_text:  change_text  || "",
              unclear_text: unclear_text || "",
              supabase_url: "https://ocuxostmzpqlkktmlqsu.supabase.co"
            }
          })
        }
      );
 
      const data = await resp.json();
      return res.status(200).json(data?.output || {});
    }
 
    return res.status(400).json({ error: "Unknown action" });
 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
