const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body || "{}");
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey || !prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt or API key." }),
      };
    }

    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    const result = await response.json();

    const reply =
      result?.generated_text ||
      result?.[0]?.generated_text ||
      "No response from model.";

    return {
      statusCode: 200,
      body: JSON.stringify({ response: reply })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: e.message })
    };
  }
};
