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

    const hfRes = await fetch("https://api-inference.huggingface.co/models/declare-lab/flan-alpaca-base", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const result = await hfRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ response: result[0]?.generated_text || "No response." })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: e.message })
    };
  }
};
