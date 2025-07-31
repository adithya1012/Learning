import React, { useState } from "react";
import { ChatBotWidget } from "chatbot-widget-ui";

const ChatWidget = () => {
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Welcome to MIE. How can I help you today?" },
  ]);

  const customApiCall = async (message: string): Promise<string> => {
    // Replace this with your real API endpoint for MIE's backend
    const response = await fetch("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: message }),
    });

    const data = await response.json();
    return data.content;
  };

  const handleBotResponse = (response: string) => {
    console.log("Bot Response:", response);
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
  };

  const handleNewMessage = (message: { role: string; content: string }) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <ChatBotWidget
      callApi={customApiCall}
      onBotResponse={handleBotResponse}
      handleNewMessage={handleNewMessage}
      messages={messages}
      primaryColor="#004a98"
      inputMsgPlaceholder="Ask us anything..."
      chatbotName="MIE Assistant"
      isTypingMessage="MIE Assistant is typing..."
      IncommingErrMsg="Sorry, something went wrong. Please try again."
      chatIcon={<div style={{ fontSize: "24px" }}>💬</div>}
      botIcon={<div style={{ fontSize: "24px" }}>🏥</div>}
      botFontStyle={{
        fontFamily: "sans-serif",
        fontSize: "14px",
      }}
      typingFontStyle={{
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: "#888",
        fontStyle: "italic",
      }}
      useInnerHTML={true}
    />
  );
};

export default ChatWidget;
