const SUPABASE_URL  = "https://ocuxostmzpqlkktmlqsu.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jdXhvc3RtenBxbGtrdG1scXN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk1NjYxNSwiZXhwIjoyMDkyNTMyNjE1fQ.4K_hpHNxOkCu8I4ngcw8Y-tStc8kvRGXeIkjfPW1Ags";

const RELEVANCE_BASE = "https://api-d7b62b.stack.tryrelevance.com/latest";
const RELEVANCE_AUTH = "d82ca31b-33c0-4b90-ab6b-5a42298cf982:sk-ZjYzMjA3YzQtZDYzMi00NWRmLTkyOTQtMjY4NzMwZTI2MzQy";
const TOOL_FEEDBACK_SUBMIT = "d7b62b/d82ca31b-33c0-4b90-ab6b-5a42298cf982/662205fe-5806-433a-9b35-142cc338291c";

const sb_headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { action } = req.query;

  try {

    // GET SESSION — direkt aus Supabase
    if (action === "get_session") {
      const { token } = req.query;
      if (!token) return res.status(400).json({ error: "token missing" });

      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/design_sessions?client_token=eq.${token}&select=*`,
        { headers: sb_headers }
      );

      const data = await resp.json();

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }

      return res.status(200).json(data[0]);
    }

    // SUBMIT FEEDBACK — via Relevance Tool
    if (action === "submit_feedback") {
      const body = req.body;
      const { client_token, keep_text, change_text, unclear_text } = body;

      if (!client_token) return res.status(400).json({ error: "client_token missing" });

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
              supabase_url: SUPABASE_URL
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
