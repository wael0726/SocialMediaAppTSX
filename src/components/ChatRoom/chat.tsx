import React, { useState } from "react";
import { useParams } from "react-router-dom";

const ChatRoom: React.FC = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, newMessage]);
      setNewMessage("");
    }
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <h2 className="text-xl font-bold mb-4">Chat avec {userId}</h2>
      <div className="bg-gray-700 p-4 rounded-md mb-4 overflow-y-auto h-[70vh]">
        {messages.map((message, index) => (
          <div key={index} className="p-2 bg-gray-800 rounded-md mb-2">
            {message}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-grow p-2 rounded-l-md bg-gray-800 text-white"
          placeholder="Tapez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 py-2 rounded-r-md text-white hover:bg-blue-500"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
