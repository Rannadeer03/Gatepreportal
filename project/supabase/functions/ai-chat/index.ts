// Server-side proxy for the live-chat "external AI" feature. The OpenAI API
// key lives only in this function's OPENAI_API_KEY secret — it is never a
// VITE_-prefixed variable, so it can never be inlined into the browser
// bundle the way it previously could via src/services/aiChatService.ts.

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const SYSTEM_PROMPT = `You are an AI support assistant for Gate Preparation Portal, a comprehensive online platform for GATE exam preparation.

Key Features:
- Mock tests and practice exams
- Study materials and resources
- Video tutorials
- Resume builder
- Performance tracking

Help users with:
- Technical issues (login, navigation, file uploads)
- Account management (registration, password reset, profile updates)
- Test-related problems (submission, timeouts, scoring)
- Payment and billing issues
- General platform guidance

Be helpful, professional, and provide specific, actionable solutions. Keep responses concise but informative.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return json({ error: 'AI chat not configured' }, 503);
  }

  let body: { message?: string; history?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const message = (body.message ?? '').toString().slice(0, 4000);
  if (!message) {
    return json({ error: 'Missing message' }, 400);
  }
  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return json({ error: `Upstream AI error: ${response.status}` }, 502);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return json({ error: 'No response from AI' }, 502);
    }

    return json({ text });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal error' }, 500);
  }
});
