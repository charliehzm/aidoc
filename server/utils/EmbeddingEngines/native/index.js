const path = require("path");
const fs = require("fs");
const { toChunks } = require("../../helpers");
const { v4 } = require("uuid");

class NativeEmbedder {
  constructor() {
    // Model Card: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    this.model = "Xenova/all-MiniLM-L6-v2";
    this.cacheDir = path.resolve(
      process.env.STORAGE_DIR
        ? path.resolve(process.env.STORAGE_DIR, `models`)
        : path.resolve(__dirname, `../../../storage/models`)
    );
    this.modelPath = path.resolve(this.cacheDir, "Xenova", "all-MiniLM-L6-v2");
    this.dimensions = 384;

    // Limit of how many strings we can process in a single pass to stay with resource or network limits
    this.maxConcurrentChunks = 25;
    this.embeddingMaxChunkLength = 1_000;

    // Make directory when it does not exist in existing installations
    if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir);
  }

  async embedderClient() {
    if (!fs.existsSync(this.modelPath)) {
      console.log(
        "\x1b[34m[INFO]\x1b[0m The native embedding model has never been run and will be downloaded right now. Subsequent runs will be faster. (~23MB)\n\n"
      );
    }

    try {
      // Convert ESM to CommonJS via import so we can load this library.
      const pipeline = (...args) => import("@xenova/transformers").then(({ pipeline }) => pipeline(...args));
      return await pipeline("feature-extraction", this.model, {
        cache_dir: this.cacheDir,
        ...(!fs.existsSync(this.modelPath)
          ? {
            // Show download progress if we need to download any files
            progress_callback: (data) => {
              if (!data.hasOwnProperty("progress")) return;
              console.log(
                `\x1b[34m[Embedding - Downloading Model Files]\x1b[0m ${data.file
                } ${~~data?.progress}%`
              );
            },
          }
          : {})
      })
    } catch (error) {
      console.error("Failed to load the native embedding model:", error);
      throw error;
    }
  }

  async embedTextInput(textInput) {
    const result = await this.embedChunks(textInput);
    return result?.[0] || [];
  }

  writeToOut(filePath, data) {
    let fd = 0;
    try {
      fd = fs.openSync(filePath, 'a', 0o666);
      let _ = fs.writeSync(fd, data, null, 'utf8');
    } catch (e) {
    } finally {
      if (fd) fs.closeSync(fd);
    }
  }

  async embedChunks(textChunks = []) {
    const filename = `${v4()}.tmp`;
    const tmpPath = path.resolve(__dirname, '../../../storage/tmp', filename)
    const chunks = toChunks(textChunks, this.maxConcurrentChunks);

    for (let [idx, chunk] of chunks.entries()) {
      if (idx === 0) this.writeToOut(tmpPath, '[');
      let data;
      let pipeline = await this.embedderClient();
      let output = await pipeline(chunk, {
        pooling: "mean",
        normalize: true,
      })

      if (output.length === 0) {
        pipeline, output, data = null;
        continue;
      }
      data = JSON.stringify(output.tolist());
      this.writeToOut(tmpPath, data)
      console.log(`wrote ${data.length} bytes`)
      if (chunks.length - 1 !== idx) this.writeToOut(tmpPath, ',')
      if (chunks.length - 1 === idx) this.writeToOut(tmpPath, ']');
      pipeline, output, data = null;
    }

    const embeddingResults = JSON.parse(fs.readFileSync(tmpPath, { encoding: 'utf-8' }))
    fs.rmSync(tmpPath, { force: true });
    // return embeddingResults.length > 0 ? embeddingResults.flat() : null;
    return null
  }

  // SURVIVES with forced GC with without when doing 500 chunks
  // async embedChunks(textChunks = []) {
  //   const filename = `${v4()}.tmp`;
  //   const tmpPath = path.resolve(__dirname, '../../../storage/tmp', filename)
  //   const chunks = toChunks(textChunks, this.maxConcurrentChunks);

  //   for (let [idx, chunk] of chunks.entries()) {
  //     // if (idx === 0) this.writeToOut(tmpPath, '[');
  //     let pipeline = await this.embedderClient();
  //     let output = await pipeline(chunk, {
  //       pooling: "mean",
  //       normalize: true,
  //     })

  //     if (output.length === 0) continue;
  //     let data = JSON.stringify(output.tolist());
  //     // this.writeToOut(tmpPath, data)
  //     console.log(`wrote ${data.length} bytes`)
  //     // if (chunks.length - 1 !== idx) this.writeToOut(tmpPath, ',')
  //     // if (chunks.length - 1 === idx) this.writeToOut(tmpPath, ']');
  //     data = null;
  //     output = null;
  //     pipeline = null
  //     global.gc ? global?.gc() : null
  //   }

  //   // const embeddingResults = JSON.parse(fs.readFileSync(tmpPath, { encoding: 'utf-8' }))
  //   // fs.rmSync(tmpPath, { force: true });
  //   // return embeddingResults.length > 0 ? embeddingResults.flat() : null;
  //   return null
  // }

  // async embedChunks(textChunks = []) {
  //   const filename = `${v4()}.tmp`;
  //   const tmpPath = path.resolve(__dirname, '../../../storage/tmp', filename)
  //   const chunks = toChunks(textChunks, this.maxConcurrentChunks);

  //   for (let [idx, chunk] of chunks.entries()) {
  //     // if (idx === 0) this.writeToOut(tmpPath, '[');
  //     let pipeline = await this.embedderClient();
  //     let output = await pipeline(chunk, {
  //       pooling: "mean",
  //       normalize: true,
  //     })

  //     if (output.length === 0) {
  //       data = null;
  //       output = null;
  //       pipeline = null;
  //       global.gc ? global?.gc() : null;
  //       continue;
  //     }
  //     let data = JSON.stringify(output.tolist());
  //     // this.writeToOut(tmpPath, data)
  //     console.log(`wrote ${data.length} bytes`)
  //     // if (chunks.length - 1 !== idx) this.writeToOut(tmpPath, ',')
  //     // if (chunks.length - 1 === idx) this.writeToOut(tmpPath, ']');
  //     data = null;
  //     output = null;
  //     pipeline = null
  //     global.gc ? global?.gc() : null
  //   }

  //   // const embeddingResults = JSON.parse(fs.readFileSync(tmpPath, { encoding: 'utf-8' }))
  //   // fs.rmSync(tmpPath, { force: true });
  //   // return embeddingResults.length > 0 ? embeddingResults.flat() : null;
  //   return null
  // }
}

module.exports = {
  NativeEmbedder,
};
