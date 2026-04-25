Gaabs Feedback Interface
Client-facing design review interface for The Gaabs — a minimal, branded web app that lets clients submit structured design feedback directly into Supabase via Relevance AI.
---
What it does
Each client receives a unique link (`/feedback/[token]`) that opens a clean, session-specific review page. They see the current design (Figma embed or image) and submit feedback in three structured fields:
What should stay — elements or directions to keep
What should change — specific adjustments or corrections
What feels unclear — instincts, not yet articulated
Feedback is automatically categorised by AI into:
Category A — mechanical tasks (fast track, handled by AI)
Category B — strategic questions (team review)
---
Stack
Layer	Tool
Frontend	HTML / CSS / Vanilla JS
Hosting	Vercel (`gaabs.theagency`)
Backend	Relevance AI (Tool 2 + Tool 3)
Database	Supabase (`design_sessions` + `design_feedback`)
---
Files
```
gaabs_feedback_interface/
├── feedback.html     # Client-facing feedback interface
├── vercel.json       # Routing: /feedback/[token] → feedback.html
└── README.md
```
---
Supabase Tables
`design_sessions`
Column	Type	Description
`id`	UUID	Primary key
`project_name`	TEXT	e.g. "Gaabs Rebrand"
`client_name`	TEXT	e.g. "Nike"
`figma_url`	TEXT	Optional Figma embed URL
`image_url`	TEXT	Optional design image URL
`version`	TEXT	e.g. "v1", "v2"
`status`	TEXT	`draft` / `live` / `archived`
`client_token`	TEXT	Unique token for client link
`created_at`	TIMESTAMPTZ	Auto-set
`design_feedback`
Column	Type	Description
`id`	UUID	Primary key
`session_id`	UUID	References `design_sessions.id`
`keep_text`	TEXT	"What should stay"
`change_text`	TEXT	"What should change"
`unclear_text`	TEXT	"What feels unclear"
`category_a`	TEXT	AI-generated mechanical tasks
`category_b`	TEXT	AI-generated strategic questions
`status`	TEXT	`new` / `reviewed` / `done`
`created_at`	TIMESTAMPTZ	Auto-set
---
Relevance AI Tools
Tool	Name	Function
Tool 1	`Design_Session_Create`	Creates a new session, generates client token + link
Tool 2	`Submit Design Feedback to Supabase`	Saves feedback, runs AI categorisation
Tool 3	`Manage Design Feedback Review`	Lists sessions, feedback, updates status
---
Workflow
```
1. Team runs Tool 1  →  creates session  →  gets /feedback/[token]
2. Link sent to client
3. Client opens link  →  sees design  →  submits feedback
4. AI categorises A/B  →  saved to Supabase
5. Team runs Tool 3  →  reviews feedback  →  marks done
```
---
Vercel Routing
```json
{
  "rewrites": [
    { "source": "/feedback/:token", "destination": "/feedback.html" },
    { "source": "/feedback",        "destination": "/feedback.html" }
  ]
}
```
Deploy: push to `main` → Vercel auto-deploys.
---
Local Preview
Open `feedback.html` directly in a browser. Without a token in the URL it runs in Demo Mode — no API calls, no token needed.
---
Brand
Typography: Arial (body) + Neuzeit Grotesk (display)
Palette: Black `#111110` / White `#ffffff` / Accent lines: green (keep), red (change), amber (unclear)
Design language: Swiss Grid, minimal, content-first
---
Maintained by: Linux Powers (E2-09) + Mila Pavlova  
PM: Rebecca  
Deadline: 13.05.2026 | Board Meeting: 18.05.2026
