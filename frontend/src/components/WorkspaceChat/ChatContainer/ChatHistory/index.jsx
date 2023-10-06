import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import { useEffect, useRef } from "react";

export default function ChatHistory({ history = [], workspace }) {
  const replyRef = useRef(null);

  useEffect(() => {
    if (replyRef.current) {
      setTimeout(() => {
        replyRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 700);
    }
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col h-full md:mt-0 pb-48 w-full justify-end items-center">
        <div className="flex flex-col items-start">
          <p className="text-white/60 text-lg font-base -ml-6 py-4">
            Welcome to your new workspace.
          </p>
          <div className="w-full text-center">
            <p className="text-white/60 text-lg font-base inline-flex items-center gap-x-2">
              To get started either{" "}
              <span className="underline font-medium cursor-pointer">
                upload a document{" "}
              </span>
              or <b className="font-medium">send a chat.</b>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[89%] pb-[100px] md:pt-[50px] md:pt-0 md:pb-5 mx-2 md:mx-0 overflow-y-scroll flex flex-col justify-start no-scroll"
      id="chat-history"
    >
      {history.map((props, index) => {
        const isLastMessage = index === history.length - 1;

        if (props.role === "assistant" && props.animate) {
          return (
            <PromptReply
              key={props.uuid}
              ref={isLastMessage ? replyRef : null}
              uuid={props.uuid}
              reply={props.content}
              pending={props.pending}
              sources={props.sources}
              error={props.error}
              workspace={workspace}
              closed={props.closed}
            />
          );
        }

        return (
          <HistoricalMessage
            key={index}
            ref={isLastMessage ? replyRef : null}
            message={props.content}
            role={props.role}
            workspace={workspace}
            sources={props.sources}
            error={props.error}
          />
        );
      })}
    </div>
  );
}
