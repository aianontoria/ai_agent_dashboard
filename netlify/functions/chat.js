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
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OpenRouter API key" }),
      };
    }

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistral:instruct", // free model
        messages: [{ role: "user", content: prompt }]
      })
    });

    const result = await openrouterRes.json();

    if (!result.choices || !result.choices[0]) {
      console.error("OpenRouter response error:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No valid choices in AI response", result }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: result.choices[0].message.content }),
    };
  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
