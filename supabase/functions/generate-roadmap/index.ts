import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { callGemini, parseRoadmapJson, STATIC_FALLBACK } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRACK_NAMES: Record<string, string> = {
  science: "Science & Engineering",
  medical: "Medical / Pharmacy",
  humanities: "Humanities / Social Sciences",
  arts: "Arts & Performance",
  business: "Business & Economics",
  abroad: "Study Abroad",
};

function buildRoadmapPrompt(onboarding: Record<string, unknown>) {
  const track = (onboarding.track as string) || "abroad";
  const levels = JSON.stringify(onboarding.level || onboarding.subject_levels || {});
  return `You are an academic strategist for the "AI Future Planner" app.
Create a personalized study roadmap as JSON only (no markdown).

Student:
- Goal: ${onboarding.goal || "Not set"}
- Track: ${TRACK_NAMES[track] || track}
- Target: ${onboarding.year || onboarding.target_year} ${onboarding.sem || onboarding.target_sem}
- Daily hours: ${onboarding.hours || onboarding.daily_hours}
- Subject levels (1-5): ${levels}

Return ONLY valid JSON with this exact shape:
{
  "capabilities": ["string", ...],
  "milestones": [
    { "title": "string", "status": "Complete|In Progress|Planned", "focus_area": "string", "bar_color": "#hex" }
  ],
  "dailyTasks": [
    { "title": "string", "duration": "string", "subject": "s-math|s-eng|s-cs|s-sat|s-sci|s-soc|s-lang" }
  ]
}

Rules:
- Exactly 5 milestones; first is "Complete", second "In Progress", rest "Planned"
- 3-5 dailyTasks for today
- capabilities: 4-5 items
- Be specific to the student's goal`;
}

async function persistRoadmap(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  parsed: Record<string, unknown>,
  source: string,
) {
  await supabase.from("milestones").delete().eq("user_id", userId);
  await supabase.from("daily_tasks").delete().eq("user_id", userId).eq("task_date", new Date().toISOString().slice(0, 10));

  const { data: roadmap, error: rmErr } = await supabase
    .from("roadmaps")
    .insert({ user_id: userId, source, raw_json: parsed })
    .select("id")
    .single();

  if (rmErr || !roadmap) throw rmErr || new Error("Failed to save roadmap");

  const milestones = (parsed.milestones as Array<Record<string, string>>) || [];
  if (milestones.length) {
    await supabase.from("milestones").insert(
      milestones.map((m, i) => ({
        roadmap_id: roadmap.id,
        user_id: userId,
        title: m.title,
        status: m.status || "Planned",
        sort_order: i,
        focus_area: m.focus_area || m.title,
        bar_color: m.bar_color || "#185FA5",
      })),
    );
  }

  const dailyTasks = (parsed.dailyTasks as Array<Record<string, string>>) || [];
  const today = new Date().toISOString().slice(0, 10);
  if (dailyTasks.length) {
    await supabase.from("daily_tasks").insert(
      dailyTasks.map((t, i) => ({
        user_id: userId,
        task_date: today,
        title: t.title,
        duration: t.duration || "—",
        subject: t.subject || "s-eng",
        source,
        sort_order: i,
      })),
    );
  }

  return roadmap.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    let onboarding = body.onboarding;

    if (!onboarding) {
      const { data } = await supabase
        .from("onboarding_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      onboarding = data;
    }

    if (!onboarding) {
      return new Response(JSON.stringify({ error: "Onboarding data required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: Record<string, unknown>;
    let source = "ai";

    try {
      const prompt = buildRoadmapPrompt(onboarding);
      const text = await callGemini(prompt, 1500);
      parsed = parseRoadmapJson(text);
    } catch {
      parsed = STATIC_FALLBACK;
      source = "fallback";
    }

    const roadmapId = await persistRoadmap(supabase, user.id, parsed, source);

    return new Response(JSON.stringify({ ok: true, roadmapId, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
