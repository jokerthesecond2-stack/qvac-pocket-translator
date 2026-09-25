import express from "express";
import {
  loadModel,
  translate,
  unloadModel,
  BERGAMOT_EN_ES,
  BERGAMOT_ES_EN
} from "@qvac/sdk";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));

const models = {
  "en-es": null,
  "es-en": null
};

const modelConfigs = {
  "en-es": {
    modelSrc: BERGAMOT_EN_ES,
    from: "en",
    to: "es"
  },
  "es-en": {
    modelSrc: BERGAMOT_ES_EN,
    from: "es",
    to: "en"
  }
};

async function getModel(direction) {
  if (models[direction]) {
    return models[direction];
  }

  const config = modelConfigs[direction];

  if (!config) {
    throw new Error("Unsupported translation direction.");
  }

  console.log(`Loading QVAC model: ${config.from} -> ${config.to}`);

  const modelId = await loadModel({
    modelSrc: config.modelSrc,
    modelType: "nmt",
    modelConfig: {
      engine: "Bergamot",
      from: config.from,
      to: config.to
    }
  });

  models[direction] = modelId;

  console.log(`QVAC model loaded: ${modelId}`);

  return modelId;
}

app.post("/api/translate", async (req, res) => {
  try {
    const { text, direction } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        error: "Please enter some text."
      });
    }

    if (!["en-es", "es-en"].includes(direction)) {
      return res.status(400).json({
        error: "Invalid translation direction."
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        error: "Text is limited to 2,000 characters."
      });
    }

    const config = modelConfigs[direction];
    const modelId = await getModel(direction);

    console.log(`Translating ${config.from} -> ${config.to}`);

    const result = translate({
      modelId,
      text: text.trim(),
      modelType: "nmtcpp-translation",
      stream: false
    });

    const translatedText = await result.text;

    res.json({
      success: true,
      translation: translatedText,
      from: config.from,
      to: config.to
    });
  } catch (error) {
    console.error("Translation error:", error);

    res.status(500).json({
      error: error?.message || "Translation failed."
    });
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    sdk: "QVAC",
    sdkVersion: "0.20.0",
    modelsLoaded: {
      "en-es": Boolean(models["en-es"]),
      "es-en": Boolean(models["es-en"])
    }
  });
});

const server = app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log(" QVAC Pocket Translator");
  console.log("======================================");
  console.log(` Open: http://localhost:${PORT}`);
  console.log(" QVAC SDK: 0.20.0");
  console.log(" Inference: Local");
  console.log("======================================");
  console.log("");
});

async function shutdown() {
  console.log("\nShutting down QVAC models...");

  for (const direction of Object.keys(models)) {
    if (models[direction]) {
      try {
        await unloadModel({
          modelId: models[direction],
          clearStorage: false
        });
      } catch (error) {
        console.error(`Failed to unload ${direction}:`, error.message);
      }
    }
  }

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);