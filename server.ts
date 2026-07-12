import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
  }

  // API endpoint: elaborate on a rule
  app.post("/api/elaborate", async (req, res) => {
    try {
      const { ruleId, statement, description, chapterTitle, chapterNumber, customQuestion } = req.body;
      if (!ruleId) {
        return res.status(400).json({ error: "ruleId is required" });
      }

      if (!ai) {
        return res.status(500).json({ 
          error: "Gemini API client not initialized. Please configure your GEMINI_API_KEY in the Secrets panel in AI Studio UI." 
        });
      }

      let prompt = `Elaborate on Rule ${ruleId}: "${statement}" from Chapter ${chapterNumber} ("${chapterTitle}").
Context: ${description}`;

      if (customQuestion && customQuestion.trim()) {
        prompt += `\n\nThe entrepreneur asks a specific question: "${customQuestion}"\nPlease address this question in your response while maintaining the structured categories.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Solomon Khumalo, a seasoned South African contracting business leader, founder of BuildPrice, and author of 'The Invincible Business'. Your style is highly professional, direct, wise, encouraging, and rich with practical commercial wisdom. Avoid generic marketing advice; give hard-hitting, concrete suggestions about cash flow, overhead recovery, risk allowance, systems, and pricing. Speak to the user as a respected fellow entrepreneur preparing for their daily business.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coreMeaning: { 
                type: Type.STRING, 
                description: "Deep, practical explanation of the business truth behind this rule, explaining what it means for survival and scaling." 
              },
              caseStudy: { 
                type: Type.STRING, 
                description: "A concrete, realistic business scenario illustrating success or failure under this rule. Make it specific and relatable." 
              },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 actionable tasks or check-ups the entrepreneur can execute TODAY before starting their daily business."
              },
              solomonsAdvice: { 
                type: Type.STRING, 
                description: "A brief, powerful personal mentorship word from Solomon Khumalo directly addressing the entrepreneur's mindset today." 
              }
            },
            required: ["coreMeaning", "caseStudy", "actions", "solomonsAdvice"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: "Empty response from Gemini AI" });
      }

      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("Elaborate API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate elaboration from Gemini AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
