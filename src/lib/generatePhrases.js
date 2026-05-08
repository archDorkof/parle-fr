const WORD_BOUNDS = {
  Short:  { min: 4,  max: 7  },
  Medium: { min: 8,  max: 13 },
  Long:   { min: 14, max: 20 },
}

export async function generatePhrases({ level, length, phrases, topic }) {
  const { min, max } = WORD_BOUNDS[length] ?? WORD_BOUNDS.Medium

  const prompt = `Generate ${phrases} French practice phrases for a ${level} CEFR level learner.
Topic: ${topic}
Phrase length: ${min}–${max} words each (count all words including articles and prepositions)
Requirements:
- Appropriate vocabulary and grammar complexity for ${level}
- Natural, conversational French a native speaker would actually say
- Varied sentence structures — no repetition of the same pattern
- Each phrase must have an accurate English translation

Return ONLY a JSON array with no extra text, markdown, or code fences:
[{"fr":"French phrase","en":"English translation"}]`

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''

  // Extract JSON array even if Claude adds surrounding text
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array found in Claude response')

  return JSON.parse(match[0])
}
