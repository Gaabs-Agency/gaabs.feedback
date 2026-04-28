const SUPABASE_URL         = process.env.feedback_SUPABASE_URL;
const SUPABASE_KEY = process.env.feedback_SUPABASE_SERVICE_ROLE_KEY;
const RELEVANCE_BASE       = process.env.RELEVANCE_BASE;
const RELEVANCE_AUTH       = process.env.RELEVANCE_AUTH;
const TOOL_FEEDBACK_SUBMIT = process.env.TOOL_FEEDBACK_SUBMIT;

// DEBUG — danach wieder löschen
console.log("DEBUG URL:", SUPABASE_URL?.substring(0, 30));
console.log("DEBUG KEY:", SUPABASE_KEY?.substring(0, 20));
