const SUPABASE_URL         = process.env.feedback_SUPABASE_URL;
const SUPABASE_KEY         = process.env.supabase_SUPABASE_SERVICE_ROLE_KEY;
const RELEVANCE_BASE       = process.env.RELEVANCE_BASE;
const RELEVANCE_AUTH       = process.env.RELEVANCE_AUTH;
const TOOL_FEEDBACK_SUBMIT = process.env.TOOL_FEEDBACK_SUBMIT;

const sb_headers = {
  "apikey":        SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type":  "application/json",
  "Prefer":        "return=representation"
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://gaabsfeedback.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action } = req.query;

  try {

    // ── GET SESSION ───────────────────────────────────────────────
    if (action === "get_session") {
      const { token } = req.query;
      if (!token) return res.status(400).json({ error: "token missing" });

      const sessResp = await fetch(
        `${SUPABASE_URL}/rest/v1/design_sessions?client_token=eq.${token}&select=*`,
        { headers: sb_headers }
      );

      if (!sessResp.ok) {
        const t = await sessResp.text();
        return res.status(500).json({ error: "Supabase session lookup failed", details: t });
      }

      const data = await sessResp.json();
      if (!data || data.length === 0) return res.status(404).json({ error: "Session not found" });
      return res.status(200).json(data[0]);
    }

    // ── SUBMIT FEEDBACK ───────────────────────────────────────────
    if (action === "submit_feedback") {
      const { client_token, keep_text, change_text, unclear_text } = req.body;
      if (!client_token) return res.status(400).json({ error: "client_token missing" });

      // 1. Session laden
      const sessResp = await fetch(
        `${SUPABASE_URL}/rest/v1/design_sessions?client_token=eq.${client_token}&select=id,client_id,project_id`,
        { headers: sb_headers }
      );

      if (!sessResp.ok) {
        const t = await sessResp.text();
        return res.status(500).json({ error: "Supabase session lookup failed", details: t });
      }

      const sessions = await sessResp.json();
      if (!sessions || sessions.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }

      const session = sessions[0];

      if (!session.client_id || !session.project_id) {
        return res.status(500).json({ error: "Session missing client_id or project_id" });
      }

      // 2. Feedback direkt in Supabase schreiben
      const fbResp = await fetch(
        `${SUPABASE_URL}/rest/v1/design_feedback`,
        {
          method:  "POST",
          headers: sb_headers,
          body: JSON.stringify({
            session_id:   session.id,
            client_id:    session.client_id,
            project_id:   session.project_id,
            keep_text:    keep_text    || null,
            change_text:  change_text  || null,
            unclear_text: unclear_text || null,
            status:       "new"
          })
        }
      );

      if (!fbResp.ok) {
        const t = await fbResp.text();
        return res.status(500).json({ error: "Feedback save failed", details: t });
      }

      const fbData = await fbResp.json();

      // 3. KI Kategorisierung async mit Timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        await fetch(
          `${RELEVANCE_BASE}/studios/${TOOL_FEEDBACK_SUBMIT}/trigger_limited`,
          {
            method:  "POST",
            signal:  controller.signal,
            headers: {
              "Content-Type":  "application/json",
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
      } catch(e) {
        console.error("KI categorization failed (non-critical):", e.message);
      } finally {
        clearTimeout(timeout);
      }

      return res.status(200).json({
        status:      "success",
        message:     "Feedback gespeichert",
        feedback_id: fbData[0]?.id || null
      });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
