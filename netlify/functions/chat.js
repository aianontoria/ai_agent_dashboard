const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    // Validate incoming request
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
        body: JSON.stringify({ error: "Prompt is missing." }),
      };
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing Hugging Face API key." }),
      };
    }

    // ✅ Use Zephyr-7B-Beta (public chat model)
    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const result = await response.json();

    // Error handling for Hugging Face response
    if (result.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Hugging Face API error: ${result.error}` }),
      };
    }

    // Grab response text
    const aiResponse = result.generated_text || result[0]?.generated_text || "No response from AI.";

    return {
      statusCode: 200,
      body: JSON.stringify({ response: aiResponse }),
    };

  } catch (err) {
    console.error("Server error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
