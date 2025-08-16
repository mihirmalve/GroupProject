import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiController {
  async ask(req, res) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(query);
      const responseText = result.response.text();

      res.status(200).json({ reply: responseText });
    } catch (err) {
      console.error("Gemini error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
}

export default new GeminiController();
