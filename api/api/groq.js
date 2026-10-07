export default async function handler(req, res) {
  const { messages } = req.body;
  
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
