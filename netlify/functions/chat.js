const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Validate input
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No request body received." }),
      };
    }

    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is missing in request." }),
      };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OpenRouter API key." }),
      };
    }

    // Make API call to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat",  // ✅ working, free model
        messages: [
          { role: "system", content: "You are a helpful AI assistant for business analytics." },
          { role: "user", content: prompt }
        ]
      })
    });

    const result = await response.json();

    // Error from OpenRouter
    if (!result.choices || !result.choices[0]) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "No valid choices in OpenRouter response.",
          result: result
        }),
      };
    }

    const aiMessage = result.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ response: aiMessage }),
    };

  } catch (err) {
    console.error("Server error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
