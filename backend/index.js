import express from "express";
import uniqid from "uniqid";
import fs from "fs";
import cors from "cors";
import { GPTScript, RunEventType } from "@gptscript-ai/gptscript";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const g = new GPTScript({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/test", (req, res) => {
  return res.json("test ok");
});

app.get("/create-story", async (req, res) => {
  const url = req.query.url;
  const dir = uniqid();
  const path = "./stories/" + dir;
  fs.mkdirSync(path, { recursive: true });

  console.log({ url });

  const opts = {
    input: `--url ${url} --dir ${path}`,
    disableCache: true,
  };

  try {
    const run = await g.run("./story.gpt", opts);

    run.on(RunEventType.Event, ev => {
      if (ev.type === RunEventType.CallFinish && ev.output) {
        console.log(ev.output);
      }
    });
    const result = await run.text();
    return res.json({ success: true, result });
  } catch (e) {
    console.error("Error in /create-story:", e.message);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to create story", 
      details: e.message 
    });
  }
});

app.listen(8080, () => console.log("Listening on port 8080"));
