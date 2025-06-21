const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
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

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing Hugging Face API key." }),
      };
    }

    // Call Hugging Face LLaMA chat model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [
            { role: "system", content: "You are a helpful assistant for business." },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    const data = await response.json();

    // Handle errors from HF API
    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `HF API error: ${data.error}` }),
      };
    }

    // The response for chat models from HF is in `data.generated_text`
    const aiResponse = data.generated_text || "No response from model.";

    return {
      statusCode: 200,
      body: JSON.stringify({ response: aiResponse }),
    };
  } catch (error) {
    console.error("Server error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error.", details: error.message }),
    };
  }
};
