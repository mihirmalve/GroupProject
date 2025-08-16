import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SocketContext from "../context/socketContext";
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import GroupInfo from "./GroupInfo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function GroupPage() {
  const { socket } = React.useContext(SocketContext);
  const navigate = useNavigate();
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  // Refs for Yjs integration
  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const yTextRef = useRef(null);
  const undoManagerRef = useRef(null);

  const chatEndRef = useRef(null); // Ref for auto-scrolling to bottom

  const userId = localStorage.getItem("user-data")
    ? JSON.parse(localStorage.getItem("user-data"))._id
    : null;
  const username = localStorage.getItem("user-data")
    ? JSON.parse(localStorage.getItem("user-data")).username
    : "";

  const { groupId } = useParams();

  // Handle editor mounting
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Connect the editor with Yjs once the editor is mounted and ydoc is initialized
    if (ydocRef.current && yTextRef.current) {
      bindEditorToYjs(editor);
    }
  };

  // Function to bind the Monaco editor with Yjs text
  const bindEditorToYjs = (editor) => {
    if (!editor || !yTextRef.current) return;
    
    // Get the Monaco model
    const model = editor.getModel();
    
    // Initial content setup
    model.setValue(yTextRef.current.toString());
    
    // Listen for changes in the editor and update the Yjs document
    editor.onDidChangeModelContent((event) => {
      // Only apply changes if they're from user input, not from Yjs
      if (!event.isFlush) {
        const editorContent = editor.getValue();
        
        // We need to avoid updating when the change comes from Yjs
        // So we check if the content already matches
        if (yTextRef.current.toString() !== editorContent) {
          // Prevent infinite loop by temporarily disabling observer
          yTextRef.current.delete(0, yTextRef.current.length);
          yTextRef.current.insert(0, editorContent);
        }
      }
    });
    
    // Listen for changes in the Yjs document and update the editor
    yTextRef.current.observe(event => {
      const editorContent = editor.getValue();
      const yContent = yTextRef.current.toString();
      
      // Only update if the content has actually changed
      if (editorContent !== yContent) {
        const model = editor.getModel();
        model.pushEditOperations(
          [], 
          [{ range: model.getFullModelRange(), text: yContent }], 
          () => null
        );
      }
    });
  };

  // Initialize Yjs document and setup synchronization
  useEffect(() => {
    if (!groupId || !socket) return;
    
    // Create a new Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    
    // Get a shared text from the document to sync with our editor
    const yText = ydoc.getText('text');
    yTextRef.current = yText;
    
    // Create undo manager for the text
    const undoManager = new Y.UndoManager(yText);
    undoManagerRef.current = undoManager;

    // Setup socket handlers for Yjs updates
    socket.on("sync", (initialContent) => {
      if (initialContent && yTextRef.current.toString() === "") {
        yTextRef.current.insert(0, initialContent);
      }
    });

    socket.on("documentUpdated", (update) => {
      // Apply incoming updates to the Yjs document
      Y.applyUpdate(ydocRef.current, new Uint8Array(update));
    });
    
    // Bind editor if it's already mounted
    if (editorRef.current) {
      bindEditorToYjs(editorRef.current);
    }

    // Cleanup function
    return () => {
      socket.off("sync");
      socket.off("documentUpdated");
      ydocRef.current = null;
      yTextRef.current = null;
      undoManagerRef.current = null;
    };
  }, [groupId, socket]);

  // Send updates to the server when the Yjs document changes
  useEffect(() => {
    if (!ydocRef.current || !socket || !groupId) return;

    // Setup observer to send updates to server
    const observer = () => {
      // Create an update
      const update = Y.encodeStateAsUpdate(ydocRef.current);
      // Send the update to the server
      socket.emit("updateDocument", Array.from(update));
    };

    // Register the observer
    ydocRef.current.on('update', observer);

    return () => {
      if (ydocRef.current) {
        ydocRef.current.off('update', observer);
      }
    };
  }, [socket, groupId]);

  // Handle code changes from the editor component
  const handleCodeChange = (value) => {
    setCode(value || "");
  };

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

    socket.on("getOnlineUsers", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users); // users is an array of userIds
    });
  
    return () => {
      socket.emit("leaveGroup", groupId);
      socket.off("previousMessages");
      socket.off("newMessage");
    };
  }, [socket, groupId]);
  
  // Scroll to bottom on message update
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

  // Handle key bindings for undo/redo
  const handleEditorKeyDown = (event) => {
    // Handle Ctrl+Z for undo
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey && undoManagerRef.current) {
      undoManagerRef.current.undo();
      event.preventDefault();
    }
    // Handle Ctrl+Shift+Z or Ctrl+Y for redo
    if ((event.ctrlKey && event.shiftKey && event.key === 'z') || 
        (event.ctrlKey && event.key === 'y')) {
      undoManagerRef.current.redo();
      event.preventDefault();
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-mono relative">
      {/* Group Info Drawer (Slide-In) */}
      {showGroupInfo && <GroupInfo groupId={groupId} userId={userId} setShowGroupInfo={setShowGroupInfo} onlineUsers={onlineUsers} />}

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
            onClick={() => setShowGroupInfo(!showGroupInfo)}
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
                  {isOwnMessage ? username : msg.senderrname}
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
                    <div className="prose prose-invert max-w-none text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.message}
                      </ReactMarkdown>
                    </div>

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
          {/* Auto-scroll anchor */}
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
        {/* Controls */}
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
          <div className="flex items-center gap-2">
            <div className="text-green-400 text-xs flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
              <span>Collaborative Mode Active</span>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div 
          className="flex-1 border border-neutral-700 rounded-xl overflow-hidden shadow-md"
          onKeyDown={handleEditorKeyDown}
        >
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
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