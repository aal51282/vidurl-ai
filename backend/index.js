import express from "express";
import uniqid from "uniqid";
import fs from "fs";
import cors from "cors";
import { GPTScript, RunEventType } from "@gptscript-ai/gptscript";

const app = express();
app.use(cors());

const g = new GPTScript();

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
    input: `--url ${url} --dir ${dir}`,
    disableCache: true,
  };

  try {
    console.log("about to run story.gpt");
    const run = await g.run("./story.gpt", opts);
    console.log("awaiting result");
    run.on(RunEventType.Event, (ev) => {
      if (ev.type === RunEventType.CallFinish && ev.output) {
        console.log(ev.output);
      }
    });
  const result = await run.text();

    return res.json(result);
  } catch (e) {
    console.log("error", e);
    return res.status(500).json(e);
  }
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
