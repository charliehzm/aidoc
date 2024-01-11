const { v4 } = require("uuid");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const {
  createdDate,
  trashFile,
  writeToServerDocuments,
} = require("../../utils/files");
const { tokenizeString } = require("../../utils/tokenizer");
const { default: slugify } = require("slugify");

async function asDocX({ fullFilePath = "", filename = "" }) {
  const loader = new DocxLoader(fullFilePath);

  console.log(`-- Working ${filename} --`);
  let docxPageContent = [];
  const docs = await loader.load();
  for (const doc of docs) {
    console.log(doc.metadata);
    console.log(`-- Parsing content from docx page --`);
    if (!doc.pageContent.length) continue;
    docxPageContent.push(doc.pageContent);
  }

  if (!docxPageContent.length) {
    console.error(`Resulting text content was empty for ${filename}.`);
    trashFile(fullFilePath);
    return { success: false, reason: `No text content found in ${filename}.` };
  }

  const content = docxPageContent.join("");
  const data = {
    id: v4(),
    url: "file://" + fullFilePath,
    title: filename,
    docAuthor: "no author found",
    description: "No description found.",
    docSource: "pdf file uploaded by the user.",
    chunkSource: filename,
    published: createdDate(fullFilePath),
    wordCount: content.split(" ").length,
    pageContent: content,
    token_count_estimate: tokenizeString(content).length,
  };

  const { pageContent, token_count_estimate, ...responseData } = data;

  writeToServerDocuments(data, `${slugify(filename)}-${data.id}`);
  trashFile(fullFilePath);
  console.log(`[SUCCESS]: ${filename} converted & ready for embedding.\n`);
  return { success: true, reason: null, document: data };
}

module.exports = asDocX;
