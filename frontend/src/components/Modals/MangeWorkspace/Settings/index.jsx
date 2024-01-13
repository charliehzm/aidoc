import React, { useState, useRef, useEffect } from "react";
import Workspace from "../../../../models/workspace";
import paths from "../../../../utils/paths";
import { chatPrompt } from "../../../../utils/chat";
import System from "../../../../models/system";
import PreLoader from "../../../Preloader";
import { useParams } from "react-router-dom";
import showToast from "../../../../utils/toast";

import OpenAiOptions from "@/components/LLMSelection/OpenAiOptions";
import AzureAiOptions from "@/components/LLMSelection/AzureAiOptions";
import AnthropicAiOptions from "@/components/LLMSelection/AnthropicAiOptions";
import GeminiLLMOptions from "@/components/LLMSelection/GeminiLLMOptions";
import OllamaLLMOptions from "@/components/LLMSelection/OllamaLLMOptions";
import LMStudioOptions from "@/components/LLMSelection/LMStudioOptions";
import LocalAiOptions from "@/components/LLMSelection/LocalAiOptions";
import TogetherAiOptions from "@/components/LLMSelection/TogetherAiOptions";
import NativeLLMOptions from "@/components/LLMSelection/NativeLLMOptions";

// Ensure that a type is correct before sending the body
// to the backend.
function castToType(key, value) {
  const definitions = {
    openAiTemp: {
      cast: (value) => Number(value),
    },
    openAiHistory: {
      cast: (value) => Number(value),
    },
    similarityThreshold: {
      cast: (value) => parseFloat(value),
    },
  };

  if (!definitions.hasOwnProperty(key)) return value;
  return definitions[key].cast(value);
}

export default function WorkspaceSettings({ active, workspace, settings }) {
  console.log("Workspace: ", workspace);
  const { slug } = useParams();
  const formEl = useRef(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [customModels, setCustomModels] = useState([]);

  const handleUpdate = async (e) => {
    setSaving(true);
    e.preventDefault();
    const data = {};
    const form = new FormData(formEl.current);
    for (var [key, value] of form.entries()) data[key] = castToType(key, value);

    console.log(data);
    const { workspace: updatedWorkspace, message } = await Workspace.update(
      workspace.slug,
      data
    );
    if (!!updatedWorkspace) {
      showToast("Workspace updated!", "success", { clear: true });
    } else {
      showToast(`Error: ${message}`, "error", { clear: true });
    }
    setSaving(false);
    setHasChanges(false);
  };

  const deleteWorkspace = async () => {
    if (
      !window.confirm(
        `You are about to delete your entire ${workspace.name} workspace. This will remove all vector embeddings on your vector database.\n\nThe original source files will remain untouched. This action is irreversible.`
      )
    )
      return false;
    await Workspace.delete(workspace.slug);
    workspace.slug === slug
      ? (window.location = paths.home())
      : window.location.reload();
  };

  // const LLMS = [
  //   {
  //     name: "OpenAI",
  //     value: "openai",
  //     options: <OpenAiOptions settings={settings} isWorkspace={true} />,
  //     description: "The standard option for most non-commercial use.",
  //   },
  //   {
  //     name: "Azure OpenAI",
  //     value: "azure",
  //     options: <AzureAiOptions settings={settings} isWorkspace={true} />,
  //     description: "The enterprise option of OpenAI hosted on Azure services.",
  //   },
  //   {
  //     name: "Anthropic",
  //     value: "anthropic",
  //     options: <AnthropicAiOptions settings={settings} isWorkspace={true} />,
  //     description: "A friendly AI Assistant hosted by Anthropic.",
  //   },
  //   {
  //     name: "Gemini",
  //     value: "gemini",
  //     options: <GeminiLLMOptions settings={settings} isWorkspace={true} />,
  //     description: "Google's largest and most capable AI model",
  //   },
  //   {
  //     name: "Ollama",
  //     value: "ollama",
  //     options: <OllamaLLMOptions settings={settings} isWorkspace={true} />,
  //     description: "Run LLMs locally on your own machine.",
  //   },
  //   {
  //     name: "LM Studio",
  //     value: "lmstudio",
  //     options: <LMStudioOptions settings={settings} isWorkspace={true} />,
  //     description:
  //       "Discover, download, and run thousands of cutting edge LLMs in a few clicks.",
  //   },
  //   {
  //     name: "Local AI",
  //     value: "localai",
  //     options: <LocalAiOptions settings={settings} isWorkspace={true} />,
  //     description: "Run LLMs locally on your own machine.",
  //   },
  //   {
  //     name: "Together AI",
  //     value: "togetherai",
  //     options: <TogetherAiOptions settings={settings} isWorkspace={true} />,
  //     description: "Run open source models from Together AI.",
  //   },
  //   {
  //     name: "Native",
  //     value: "native",
  //     options: <NativeLLMOptions settings={settings} isWorkspace={true} />,
  //     description:
  //       "Use a downloaded custom Llama model for chatting on this AnythingLLM instance.",
  //   },
  // ];

  // const selectedLLMOptions = LLMS.find(
  //   (llm) => llm.value === settings?.LLMProvider
  // )?.options;

  // const llmName = LLMS.find((llm) => llm.value === settings?.LLMProvider).name;

  useEffect(() => {
    async function getCustomModels() {
      const customModels = await System.customModels(settings?.LLMProvider);
      setCustomModels(customModels?.models || []);
    }

    getCustomModels();
  }, [settings?.LLMProvider]);

  return (
    <form ref={formEl} onSubmit={handleUpdate}>
      <div className="-mt-12 px-12 pb-6 flex flex-col h-full w-full max-h-[80vh] overflow-y-scroll">
        <div className="flex flex-col gap-y-1 min-w-[900px]">
          <div className="text-white text-opacity-60 text-sm font-bold uppercase py-6 border-b-2 border-white/10">
            Workspace Settings
          </div>
          <div className="flex flex-row w-full py-6 border-b-2 border-white/10">
            <div className="w-1/2">
              <h3 className="text-white text-sm font-semibold">
                Vector database identifier
              </h3>
              <p className="text-white text-opacity-60 text-xs font-medium py-1.5">
                {" "}
              </p>
              <p className="text-white text-opacity-60 text-sm font-medium">
                {workspace?.slug}
              </p>
            </div>

            <div className="w-1/2">
              <h3 className="text-white text-sm font-semibold">
                Number of vectors
              </h3>
              <p className="text-white text-opacity-60 text-xs font-medium my-[2px]">
                Total number of vectors in your vector database.
              </p>
              <VectorCount reload={active} workspace={workspace} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-1 w-full mt-7">
          <div className="flex">
            <div className="flex flex-col gap-y-4 w-1/2">
              <div className="w-3/4 flex flex-col gap-y-4">
                {/* Chat model */}
                <div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white"
                    >
                      Chat model (LLM: {settings?.LLMProvider})
                    </label>
                    <p className="text-white text-opacity-60 text-xs font-medium py-1.5">
                      The specific chat model that will be used for this
                      workspace.
                    </p>
                  </div>
                  <select
                    name="chatModel"
                    required={true}
                    onChange={() => {
                      setHasChanges(true);
                    }}
                    className="bg-zinc-900 border border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
                  >
                    <optgroup label="General LLM models">
                      {[
                        "gpt-3.5-turbo",
                        "gpt-4",
                        "gpt-4-1106-preview",
                        "gpt-4-32k",
                      ].map((model) => {
                        return (
                          <option
                            key={model}
                            value={model}
                            selected={
                              workspace?.chatModel === model ||
                              settings?.OpenAiModelPref === model
                            }
                          >
                            {model}
                          </option>
                        );
                      })}
                    </optgroup>
                    {customModels.length > 0 && (
                      <optgroup label="Your fine-tuned models">
                        {customModels.map((model) => {
                          return (
                            <option
                              key={model.id}
                              value={model.id}
                              selected={
                                workspace?.chatModel === model ||
                                workspace?.chatModel === model.id
                              }
                            >
                              {model.id}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white"
                    >
                      Workspace Name
                    </label>
                    <p className="text-white text-opacity-60 text-xs font-medium py-1.5">
                      This will only change the display name of your workspace.
                    </p>
                  </div>
                  <input
                    name="name"
                    type="text"
                    minLength={2}
                    maxLength={80}
                    defaultValue={workspace?.name}
                    className="bg-zinc-900 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="My Workspace"
                    required={true}
                    autoComplete="off"
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white"
                    >
                      LLM Temperature
                    </label>
                    <p className="text-white text-opacity-60 text-xs font-medium py-1.5">
                      This setting controls how "random" or dynamic your chat
                      responses will be.
                      <br />
                      The higher the number (2.0 maximum) the more random and
                      incoherent.
                      <br />
                      <i>Recommended: 0.7</i>
                    </p>
                  </div>
                  <input
                    name="openAiTemp"
                    type="number"
                    min={0.0}
                    max={2.0}
                    step={0.1}
                    onWheel={(e) => e.target.blur()}
                    defaultValue={workspace?.openAiTemp ?? 0.7}
                    className="bg-zinc-900 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="0.7"
                    required={true}
                    autoComplete="off"
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <div className="flex flex-col gap-y-1 mb-4">
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-white"
                    >
                      Chat History
                    </label>
                    <p className="text-white text-opacity-60 text-xs font-medium">
                      The number of previous chats that will be included in the
                      response's short-term memory.
                      <i>Recommend 20. </i>
                      Anything more than 45 is likely to lead to continuous chat
                      failures depending on message size.
                    </p>
                  </div>
                  <input
                    name="openAiHistory"
                    type="number"
                    min={1}
                    max={45}
                    step={1}
                    onWheel={(e) => e.target.blur()}
                    defaultValue={workspace?.openAiHistory ?? 20}
                    className="bg-zinc-900 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="20"
                    required={true}
                    autoComplete="off"
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="w-3/4">
                <div className="flex flex-col">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white"
                  >
                    Prompt
                  </label>
                  <p className="text-white text-opacity-60 text-xs font-medium py-1.5">
                    The prompt that will be used on this workspace. Define the
                    context and instructions for the AI to generate a response.
                    You should to provide a carefully crafted prompt so the AI
                    can generate a relevant and accurate response.
                  </p>
                </div>
                <textarea
                  name="openAiPrompt"
                  rows={5}
                  defaultValue={chatPrompt(workspace)}
                  className="bg-zinc-900 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Given the following conversation, relevant context, and a follow up question, reply with an answer to the current question the user is asking. Return only your response to the question given the above information following the users instructions as needed."
                  required={true}
                  wrap="soft"
                  autoComplete="off"
                  onChange={() => setHasChanges(true)}
                />
                <div className="mt-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white"
                    >
                      Document similarity threshold
                    </label>
                    <p className="text-white text-opacity-60 text-xs font-medium py-1.5">
                      The minimum similarity score required for a source to be
                      considered related to the chat. The higher the number, the
                      more similar the source must be to the chat.
                    </p>
                  </div>
                  <select
                    name="similarityThreshold"
                    defaultValue={workspace?.similarityThreshold ?? 0.25}
                    className="bg-zinc-900 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    onChange={() => setHasChanges(true)}
                    required={true}
                  >
                    <option value={0.0}>No restriction</option>
                    <option value={0.25}>
                      Low (similarity score &ge; .25)
                    </option>
                    <option value={0.5}>
                      Medium (similarity score &ge; .50)
                    </option>
                    <option value={0.75}>
                      High (similarity score &ge; .75)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-2 md:p-6 space-x-2 border-t rounded-b border-gray-600">
        <DeleteWorkspace workspace={workspace} onClick={deleteWorkspace} />
        {hasChanges && (
          <button
            type="submit"
            className="transition-all duration-300 border border-slate-200 px-5 py-2.5 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
          >
            {saving ? "Updating..." : "Update workspace"}
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteWorkspace({ workspace, onClick }) {
  const [canDelete, setCanDelete] = useState(false);
  useEffect(() => {
    async function fetchKeys() {
      const canDelete = await System.getCanDeleteWorkspaces();
      setCanDelete(canDelete);
    }
    fetchKeys();
  }, [workspace?.slug]);

  if (!canDelete) return null;
  return (
    <button
      onClick={onClick}
      type="button"
      className="transition-all duration-300 border border-transparent rounded-lg whitespace-nowrap text-sm px-5 py-2.5 focus:z-10 bg-transparent text-white hover:text-white hover:bg-red-600"
    >
      Delete Workspace
    </button>
  );
}

function VectorCount({ reload, workspace }) {
  const [totalVectors, setTotalVectors] = useState(null);
  useEffect(() => {
    async function fetchVectorCount() {
      const totalVectors = await System.totalIndexes(workspace.slug);
      setTotalVectors(totalVectors);
    }
    fetchVectorCount();
  }, [workspace?.slug, reload]);

  if (totalVectors === null) return <PreLoader size="4" />;
  return (
    <p className="text-white text-opacity-60 text-sm font-medium">
      {totalVectors}
    </p>
  );
}
