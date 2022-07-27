import React, { useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import useSound from "use-sound";
import config from "../../../config";
import LatestMessagesContext from "../../../contexts/LatestMessages/LatestMessages";
import TypingMessage from "./TypingMessage";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import "../styles/_messages.scss";

const socket = io(config.BOT_SERVER_ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  let [message, setMessage] = useState("");

  let [botTyping, setBotTyping] = useState(false);
  let [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("bot-message", (message) => {
      setBotTyping(false);
      setLatestMessage("bot", message);
      setMessages([
        ...messages,
        {
          user: "bot",
          message,
        },
      ]);
      playReceive();
    });
  }, [messages]);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messages.map((message) => (
          <Message  message={message} />
        ))}
        {botTyping && <TypingMessage />}
      </div>

      <Footer
        value={message}
        message={message.length !== 0}
        sendMessage={async () => {
          setBotTyping(true);
          setLatestMessage("user", message);

          setMessage("");
          await socket.emit("user-message", message);

          setMessages([
            ...messages,
            {
              user: "me",
              message,
            },
          ]);
          playSend();
        }}
        onChangeMessage={(e) => {
          console.log(e, "e");
          setMessage(e.target.value);
        }}
      />
    </div>
  );
}

export default Messages;
