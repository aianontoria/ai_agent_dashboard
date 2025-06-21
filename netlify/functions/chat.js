const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt." }),
      };
    }

    const response = await fetch("https://api.deepseek.chat/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        history: [],
        model: "deepseek-chat"
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Deepseek API error:", text);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Error from Deepseek API", details: text }),
      };
    }

    const data = await response.json();

    if (!data.response) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No response from Deepseek API." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: data.response }),
    };
  } catch (err) {
    console.error("Server error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
