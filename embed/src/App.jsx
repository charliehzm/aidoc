import useGetScriptAttributes from "@/hooks/useScriptAttributes";
import useSessionId from "@/hooks/useSessionId";
import useOpenChat from "@/hooks/useOpen";
import Head from "@/components/Head";
import OpenButton from "@/components/OpenButton";
import ChatWindow from "./components/ChatWindow";
import { useEffect } from "react";

export default function App() {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const embedSettings = useGetScriptAttributes();
  const sessionId = useSessionId();

  useEffect(() => {
    if (embedSettings.openOnLoad === "on") {
      toggleOpenChat(true);
    }
  }, [embedSettings.loaded]);

  if (!embedSettings.loaded) return null;
  return (
    <>
      <Head />
      <div className="fixed bottom-0 right-0 mb-4 mr-4 z-50">
        <div
          style={{
            width: isChatOpen ? 400 : "auto",
            height: isChatOpen ? 700 : "auto",
          }}
          className={`${
            isChatOpen
              ? "max-w-[400px] max-h-[700px] bg-white rounded-lg border shadow-lg"
              : "w-16 h-16 rounded-full"
          }`}
        >
          {isChatOpen && (
            <ChatWindow
              closeChat={() => toggleOpenChat(false)}
              settings={embedSettings}
              sessionId={sessionId}
            />
          )}
          <OpenButton
            settings={embedSettings}
            isOpen={isChatOpen}
            toggleOpen={() => toggleOpenChat(true)}
          />
        </div>
      </div>
    </>
  );
}
