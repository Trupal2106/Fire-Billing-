import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      appName: "Patel Fire Billing",
      time: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // AI Assistant endpoint using Google GenAI SDK (server-side only)
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          reply: "AI key is not configured yet in the Settings > Secrets panel. However, all core billing, invoice calculation, GST rules, PDF exports, and database features work completely offline and locally!",
          offlineFallback: true
        });
      }

      const { prompt, businessContext } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are the specialized AI business assistant for "Patel Electricals & Fire System Solutions" (Patel Fire Billing app).
You assist the owner, technicians, and accountants with:
1. Fire safety standards (IS 2190 for extinguisher selection/maintenance, NBC 2016, NFPA guidance, fire pump testing standards, hydrant systems, sprinkler networks, fire alarm testing).
2. GST taxation rules for fire equipment (typically 18% for fire alarms, extinguishers, hydrants, services SAC 9987/9954).
3. Draft quotations, client follow-up messages, payment reminder letters, AMC contract term recommendations, and technical inspection remarks.
4. Business analytics summary and recommendations based on current business metrics provided.

Current context summary:
${businessContext ? JSON.stringify(businessContext, null, 2) : "Standard fire safety & billing context."}

Provide crisp, professional, actionable, and courteous guidance formatted in clean markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      return res.json({ reply: response.text || "No response generated." });
    } catch (err: any) {
      console.error("AI assistant error:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate AI response",
        fallback: true
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Patel Fire Billing server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
