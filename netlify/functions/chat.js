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

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ response: data.response || "No response." }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
