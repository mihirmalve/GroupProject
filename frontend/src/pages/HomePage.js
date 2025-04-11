import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import Editor from "@monaco-editor/react";
import axios from "axios";
import CreateGroupPage from "./CreateGroupPage";
import JoinGroupPage from "./JoinGroupPage";

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [input,setInput]=useState("");
  const [showCreateGroupPage,setShowCreateGroupPage]=useState(false);
  const [showJoinGroupPage,setShowJoinGroupPage]=useState(false);


  const joinedGroups = [
    "DSA Squad",
    "Frontend Ninjas",
    "CodeCrushers",
    "NightOwls",
    "Team Alpha",
    "Backup Team",
  ];

  const handleCompile = async () => {
    try {
      const res = await axios.post("http://localhost:8000/compile", {
        code,
        language,
        input,
      });
      console.log(res)
      
      setOutput(res.data.output || res.data.error);
     
    }  catch (err) {
    // have to handle the time limit excedded properly
      if (err.response || err.response.data || err.response.data.error) {
        setOutput(err.response.data.error);
      } else {
        setOutput("An unknown error occurred.");
      }
    }
    
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-gray-200 flex flex-col font-sans">
      {/* Top Bar */}
      {showCreateGroupPage && <CreateGroupPage show={showCreateGroupPage}
          setShow={setShowCreateGroupPage}/>}
          {showJoinGroupPage && <JoinGroupPage show={showJoinGroupPage}
          setShow={setShowJoinGroupPage}/>}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <FiMenu className="text-gray-300 text-2xl hover:text-red-500 transition" />
        </button>
        <h1 className="text-lg tracking-wide text-gray-300">BROCODE</h1>
        <div className="text-sm text-gray-400">Hi, User!</div>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute top-14 left-4 w-44 rounded-md shadow-md bg-neutral-800 border border-neutral-700 z-50">
            <div className="px-4 py-2 hover:bg-neutral-700 cursor-pointer transition">My Profile</div>
            <div className="px-4 py-2 hover:bg-neutral-700 cursor-pointer transition" 
            onClick={()=>{setMenuOpen(!menuOpen);
              setShowCreateGroupPage(!showCreateGroupPage);
            }}>Create Group</div>
            <div className="px-4 py-2 hover:bg-neutral-700 cursor-pointer transition"
             onClick={()=>{setMenuOpen(!menuOpen);
              setShowJoinGroupPage(!showCreateGroupPage);
            }}
            >Join Group</div>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-neutral-900 p-4 border-r border-neutral-800">
          <h2 className="text-base text-gray-400 mb-3">Your Groups</h2>
          <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {joinedGroups.map((group, index) => (
              <li
                key={index}
                className="bg-neutral-800 p-2 rounded hover:bg-neutral-700 cursor-pointer text-sm"
              >
                {group}
              </li>
            ))}
          </ul>
        </div>

        {/* Editor + Output Area */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Controls */}
          <div className="flex items-center gap-4 mb-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-neutral-800 text-sm p-2 rounded"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button
              onClick={() => {
                setOutput("Compiling your code....");
                handleCompile();
              }}
              
              className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm"
            >
              Compile & Run
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 border border-neutral-700 rounded overflow-hidden mb-2">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
            />
          </div>

          
          <div className="flex gap-4 items-start">
              {/* Output */}
              <div className="w-[70%] bg-neutral-900 p-3 rounded border border-neutral-700 text-sm h-40 overflow-auto">
                <h2 className="text-red-500 mb-1 font-medium">Output:</h2>
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>

              {/* Input */}
              <div className="w-[30%]">
                <h2 className="text-red-500 mb-1 font-medium">Input:</h2>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input for the code..."
                    className="w-full h-32 p-2 border border-neutral-700 
                      rounded bg-neutral-900 text-white resize-none text-sm 
                      focus:outline-none focus:ring-2  focus:ring-red-500 focus:border-red-500"
                  />

               </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default HomePage;
