export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Get API key from Vercel Environment Variables
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("GROQ_API_KEY environment variable is not set on Vercel.");
    return res.status(500).json({
      error: "API Key missing on server"
    });
  }

  const { messages } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: "Invalid messages format"
    });
  }

  try {
    // 25-second timeout
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 25000);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: messages,
          temperature: 0.4,
          max_tokens: 500
        }),

        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    // Handle Groq errors
    if (!response.ok) {
      const errorData = await response.text();

      console.error(
        `Groq API Error [${response.status}]:`,
        errorData
      );

      return res.status(response.status).json({
        error: "Groq API Error",
        details: errorData
      });
    }

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {

    if (error.name === "AbortError") {
      console.error("Request to Groq timed out.");

      return res.status(504).json({
        error: "Request timed out"
      });
    }

    console.error("Server Error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
}
