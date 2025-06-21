const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No request body received" }),
      };
    }

    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No prompt provided" }),
      };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral:instruct',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        response: result.choices?.[0]?.message?.content || "No AI response."
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
