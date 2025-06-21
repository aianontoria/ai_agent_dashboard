const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body);

    const apiKey = process.env.OPENROUTER_API_KEY; // Set this securely in Netlify environment variables

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // or any supported model
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ response: result.choices?.[0]?.message?.content || "No response from API" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
