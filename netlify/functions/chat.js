const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    console.log("Received event:", event);

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No request body received." }),
      };
    }

    const { prompt } = JSON.parse(event.body);
    console.log("Prompt:", prompt);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is missing." }),
      };
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    console.log("API key loaded:", !!apiKey);

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing Hugging Face API key." }),
      };
    }

    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const result = await response.json();
    console.log("HF API response:", result);

    if (result.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Hugging Face API error: ${result.error}` }),
      };
    }

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
