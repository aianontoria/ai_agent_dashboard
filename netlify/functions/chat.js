const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body);

    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ response: result.choices?.[0]?.message?.content || "No response" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
