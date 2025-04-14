// 👇 Updated Imports
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SocketContext from "../context/socketContext";

export default function GroupPage() {
  const { socket } = React.useContext(SocketContext);
  const navigate = useNavigate();
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState(["You", "U1", "U2", "U3"]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const chatEndRef = useRef(null); // 🔥 Ref for auto-scrolling to bottom

  const userId = localStorage.getItem("user-data")
    ? JSON.parse(localStorage.getItem("user-data"))._id
    : null;
    const username = localStorage.getItem("user-data")
    ? JSON.parse(localStorage.getItem("user-data")).username
    : "";

  const { groupId } = useParams();

  // Modify your existing useEffect for previous messages
useEffect(() => {
    if (!socket || !groupId) return;
  
    socket.emit("joinGroup", groupId);
  
    socket.on("previousMessages", (msgs) => {
      setMessages(msgs);
      // Scroll to bottom immediately after loading previous messages
      setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 100); // Small timeout to ensure DOM updates
    });
  
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      console.log("Message received");
    });
  
    return () => {
      socket.emit("leaveGroup", groupId);
    };
  }, [socket, groupId]);
  
  // Keep your existing useEffect for smooth scrolling on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 🔥 Scroll to bottom on message update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    socket.emit("sendMessage", {
      username: username,
      groupId,
      messageContent: message,
      userId,
    });

    setMessage("");
  };

  const handleCompile = async () => {
    try {
      const res = await axios.post("http://localhost:8000/compile", {
        code,
        language,
        input,
      });
      setOutput(res.data.output || res.data.error);
    } catch (err) {
      setOutput(err.response?.data?.error || "An unknown error occurred.");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-mono relative">
      {/* 🔥 Group Info Drawer (Slide-In) */}
      {showGroupInfo && (
        <div className="absolute left-0 top-0 bottom-0 w-[250px] bg-neutral-950 border-r border-neutral-800 z-10 shadow-lg transition-transform duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
            <h2 className="text-sm font-bold text-red-500">Group Members</h2>
            <button
              onClick={() => setShowGroupInfo(false)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-transparent text-xs space-y-2">
            {users.map((user, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>{user}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      <div className="w-[25%] border-r border-neutral-800 bg-neutral-950 flex flex-col shadow-lg transition-colors duration-200">
        <div className="p-3 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <button
            className="bg-red-600 hover:bg-red-700 transition-all text-white px-3 py-1.5 rounded text-xs shadow-md"
            onClick={() => navigate("/home")}
          >
            ← Back to Home
          </button>
          <button
            onClick={() => setShowGroupInfo(true)}
            className="text-xs text-red-400 hover:text-red-300 underline"
          >
            Group Info
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-transparent">
          <div className="text-center my-2">
            <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
              Today
            </span>
          </div>
          {messages.map((msg, idx) => {
            const isOwnMessage = msg.sender === userId;
            const time = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  isOwnMessage ? "self-end items-end" : "items-start"
                }`}
              >
                {/* Sender Name */}
                <span className="text-[10px] text-neutral-400 mb-0.5">
                  {isOwnMessage ? username : msg.sendername}
                </span>

                <div
                  className={`flex items-start ${
                    isOwnMessage ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar Circle */}
                  <div
                    className={`h-6 w-6 rounded-full ${
                      isOwnMessage ? "bg-red-600 ml-2" : "bg-blue-600 mr-2"
                    } flex items-center justify-center text-xs mt-0.5`}
                  >
                    {msg.sender[0]}
                  </div>

                  {/* Message Bubble with Timestamp */}
                  <div
                    className={`px-3 py-2 rounded-lg text-xs shadow-sm relative ${
                      isOwnMessage
                        ? "bg-red-900/30 rounded-tr-none"
                        : "bg-neutral-800 rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                    <div
                      className={`text-[10px] text-neutral-500 mt-1 ${
                        isOwnMessage ? "text-right" : "text-left"
                      }`}
                    >
                      {time}
                      
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* 👇 Auto-scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900 transition-colors duration-200">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-neutral-800 text-white px-3 py-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500 pr-8"
            />
            <button
              onClick={sendMessage}
              className="absolute right-2 top-1.5 text-red-500 hover:text-red-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 p-4 flex flex-col space-y-3">
        {/* 🔘 Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-neutral-800 text-sm px-3 py-2 rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button
              onClick={() => {
                setOutput("Compiling your code...");
                handleCompile();
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm shadow-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Compile & Run
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 border border-neutral-700 rounded-xl overflow-hidden shadow-md">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
            }}
          />
        </div>

        {/* Output/Input Area */}
        <div className="flex gap-4">
          <div className="w-[70%] bg-neutral-900 rounded-lg border border-neutral-700 text-sm h-40 overflow-auto shadow-sm flex flex-col">
            <div className="px-4 py-2 border-b border-neutral-700 bg-neutral-800">
              <h2 className="text-red-500 font-semibold text-xs">Output:</h2>
            </div>
            <pre className="whitespace-pre-wrap text-sm p-4 flex-1">
              {output}
            </pre>
          </div>
          <div className="w-[30%] bg-neutral-900 rounded-lg border border-neutral-700 text-sm h-40 overflow-auto shadow-sm flex flex-col">
            <div className="px-4 py-2 border-b border-neutral-700 bg-neutral-800">
              <h2 className="text-red-500 font-semibold text-xs">Input:</h2>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for the code..."
              className="flex-1 p-4 bg-neutral-900 text-white text-sm resize-none border-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
