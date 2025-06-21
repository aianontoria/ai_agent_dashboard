// Load node-fetch for making HTTP requests
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // 1. ✅ Parse the incoming request
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

    // 2. ✅ Get the Hugging Face API key from environment variable
    // ------------------------------------------------------------
    // 👉 You MUST add this key in Netlify Dashboard under:
    // Site settings → Environment variables:
    //
    // Name:    HUGGINGFACE_API_KEY
    // Value:   hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    //
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing Hugging Face API key. Set HUGGINGFACE_API_KEY in Netlify." }),
      };
    }

    // 3. 🧠 Call the Hugging Face LLaMA chat model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`, // ✅ We use the secret here
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [
            { role: "system", content: "You are a helpful assistant for business questions." },
            { role: "user", content: prompt }
          ]
        }),
      }
    );

    const data = await response.json();

    // 4. ❌ Check for errors from the HF API
    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Hugging Face API error: ${data.error}` }),
      };
    }

    // 5. ✅ Return the result (default fallback if format varies)
    const aiResponse = data.generated_text || data[0]?.generated_text || "No response from AI model.";

    return {
      statusCode: 200,
      body: JSON.stringify({ response: aiResponse }),
    };

  } catch (err) {
    console.error("AI Server error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error.", details: err.message }),
    };
  }
};
