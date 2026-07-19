const MODEL = 'claude-sonnet-5';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const SECTION_COLORS = ['#FFFF00', '#39FF14', '#FF10F0'];

const outputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'greeting', 'verdict', 'roastBlocks', 'localReality', 'finalLine'],
  properties: {
    score: { type: 'integer', description: 'A brutally honest viability score from 0 to 100.' },
    greeting: { type: 'string', description: 'A short personalized opening line.' },
    verdict: { type: 'string', description: 'The core diagnosis in one sharp paragraph.' },
    roastBlocks: {
      type: 'array',
      description: 'Four to six personalized sections. Choose the titles and subjects based on this specific startup rather than a fixed template.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'body'],
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
        },
      },
    },
    localReality: { type: 'string', description: 'A useful, non-stereotyping observation about the stated location and market context.' },
    finalLine: { type: 'string', description: 'A memorable closing sentence with actionable truth.' },
  },
};

const systemPrompt = `You are the editor of Roast My Startup, a brutal startup feedback product.

Write a deeply personalized teardown of the startup and business plan. Be sarcastic, sharp, occasionally funny, and genuinely useful. Attack weak assumptions, strategy, product choices, market logic, distribution, defensibility, founder-market fit, and business economics—not the founder's identity.

Important rules:
- Do not use a fixed roast structure. Decide what deserves attention, in what order, and invent section titles that fit this specific submission.
- Ground every criticism and joke in information the founder actually supplied. Never invent traction, competitors, credentials, or facts.
- Use relevant founder background, experience, age range, and location to personalize the analysis, but do not stereotype or insult protected traits.
- Identify the few most dangerous flaws instead of mechanically covering a startup checklist.
- Explain why each flaw matters and, where useful, point toward a better decision.
- Do not call it a pitch review. Review the overall startup and business plan.
- Do not reveal or mention private contact details.
- Avoid generic filler, praise sandwiches, false hope, slurs, threats, or cruelty unrelated to the business.
- Keep the result punchy and readable. Return four to six roast blocks.`;

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Claude is not configured yet.' });
  }

  const submission = {
    idea: clean(req.body?.idea, 6000),
    founderBackground: clean(req.body?.founderBackground, 4000),
    firstName: clean(req.body?.first, 80),
    lastName: clean(req.body?.last, 80),
    ageRange: clean(req.body?.age, 30),
    experience: clean(req.body?.experience, 80),
    location: clean(req.body?.loc, 160),
    linkedInProvided: Boolean(clean(req.body?.linkedin, 500)),
  };

  if (!submission.idea || !submission.founderBackground || !submission.firstName || !submission.location) {
    return res.status(400).json({ error: 'The required founder and startup details are missing.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const anthropicResponse = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        thinking: { type: 'disabled' },
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Roast this startup based only on the following founder submission:\n${JSON.stringify(submission, null, 2)}`,
        }],
        output_config: { format: { type: 'json_schema', schema: outputSchema } },
      }),
    });

    const payload = await anthropicResponse.json();
    if (!anthropicResponse.ok) {
      console.error('Anthropic request failed', anthropicResponse.status, payload?.error?.type, payload?.error?.message);
      return res.status(502).json({ error: 'Claude refused to clock in. Try again in a moment.' });
    }

    const text = payload.content?.find((block) => block.type === 'text')?.text;
    const generated = JSON.parse(text);
    const blocks = Array.isArray(generated.roastBlocks) ? generated.roastBlocks.slice(0, 6) : [];
    if (!blocks.length) throw new Error('Claude returned no roast blocks.');

    const first = submission.firstName || 'founder';
    return res.status(200).json({
      roast: {
        first,
        loc: submission.location || 'your undisclosed bunker',
        score: Math.max(0, Math.min(100, Math.round(Number(generated.score) || 0))),
        greet: generated.greeting,
        verdict: generated.verdict,
        sections: blocks.map((block, index) => [block.title, SECTION_COLORS[index % SECTION_COLORS.length], block.body]),
        local: generated.localReality,
        final: generated.finalLine,
      },
      model: MODEL,
    });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    console.error('Roast generation failed', timedOut ? 'timeout' : error?.name);
    return res.status(timedOut ? 504 : 500).json({ error: timedOut ? 'Claude took too long. Try again.' : 'The roast caught fire. Try again.' });
  } finally {
    clearTimeout(timeout);
  }
}
