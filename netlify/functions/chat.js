const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No request body received." }),
      };
    }

    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!prompt || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt or Hugging Face API key." }),
      };
    }

    // 🧠 Use Falcon-7B-Instruct (chat-ready model)
    const response = await fetch("https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const result = await response.json();

    if (result.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.error }),
      };
    }

    const aiResponse = result.generated_text || result[0]?.generated_text || "No response generated.";

    return {
      statusCode: 200,
      body: JSON.stringify({ response: aiResponse })
    };

  } catch (err) {
    console.error("Server error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
