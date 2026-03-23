export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, max } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatorio' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://iashopee-p7ve.vercel.app',
        'X-Title': 'Shopee Viral Pro'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        max_tokens: max || 1000,
        messages: [
          {
            role: 'system',
            content: 'Você é especialista em vendas na Shopee, afiliados e marketing digital. SEMPRE responda em português brasileiro. Seja direto, prático e use emojis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
