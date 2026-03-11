import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";

const icons = Quill.import("ui/icons");
icons["undo"] = `<svg viewBox="0 0 18 18">
  <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
  <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
</svg>`;
icons["redo"] = `<svg viewBox="0 0 18 18">
  <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
  <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
</svg>`;

// Setup Toolbar Options exactly as before, adding undo/redo to a custom container
const TOOLBAR_OPTIONS = {
  container: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["undo", "redo"], // Custom buttons
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ],
  handlers: {
    undo: function () {
      this.quill.history.undo();
    },
    redo: function () {
      this.quill.history.redo();
    },
  },
};

const SAVE_INTERVAL_MS = 2000;

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useContext(AuthContext);

  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [title, setTitle] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Native DOM Setup for Quill (100% crash proof from React 18 strict mode)
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = ""; // Clear wrapper to avoid double mounting completely 
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: { 
        toolbar: TOOLBAR_OPTIONS,
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true
        }
      },
      placeholder: "Start typing your document here...",
    });

    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  // 1. Initialize Socket
  useEffect(() => {
    let s;
    try {
      s = io("http://localhost:5000", {
        reconnectionAttempts: 3,
        timeout: 5000,
      });
      setSocket(s);
    } catch (err) {
      setError("Failed to connect to Websocket server.");
      console.error(err);
    }
    
    return () => {
      if (s) s.disconnect();
    };
  }, []);

  // 2. Fetch Document Info
  useEffect(() => {
    let isMounted = true;
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        if (!isMounted) return;
        setTitle(res.data.title || "Untitled Document");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching document:", err);
        if (isMounted) {
          setError(err.response?.data?.msg || "Document not found or you don't have access.");
          setLoading(false);
        }
      }
    };
    fetchDoc();
    return () => {
      isMounted = false;
    };
  }, [id, api]);

  // 3. Socket: Load Document Contents
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      try {
        // Handle MongoDB returning plain strings or correct Quill Delta format
        if (document && document.ops) {
          quill.setContents(document);
        } else if (typeof document === "string" && document.trim() !== "") {
          quill.insertText(0, document);
        } else {
           // Provide an empty state safely
          quill.setContents([{ insert: "\n" }]);
        }
        quill.enable(); // Turn on editor only after parsing is done
      } catch (err) {
        console.error("Failed to parse document format:", err);
        quill.setContents([{ insert: "\n" }]);
        quill.enable();
      }
    });

    socket.emit("join-document", id);
  }, [socket, quill, id]);

  // 4. Socket: Receive Changes
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // 5. Socket: Auto-Save
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [socket, quill]);

  // 6. Socket: Send Changes (User Input)
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);
    
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  // Title Update
  const handleTitleChange = async (e) => {
    setTitle(e.target.value);
    try {
      await api.put(`/documents/${id}`, { title: e.target.value });
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="rounded-xl bg-red-50 p-8 shadow-sm border border-red-100 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Document</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading document system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex shrink-0 items-center justify-between bg-white px-6 py-4 shadow-sm z-10 border-b border-gray-200">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-semibold hidden sm:inline">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Document Title"
            className="w-full max-w-md rounded-md border border-transparent px-3 py-1.5 text-xl font-bold text-gray-900 hover:bg-gray-100 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-sm text-green-700 font-medium shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Connected
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto bg-gray-100 py-8 flex justify-center px-4 sm:px-8 custom-scrollbar">
        <div className="w-full max-w-[8.5in] min-h-[11in] bg-white shadow-xl border border-gray-200 rounded-sm pb-16 relative">
          {/* This wrapper element is controlled entirely by Native Quill */}
          <div ref={wrapperRef} className="h-full border-none editor-container"></div>
        </div>
      </main>
    </div>
  );
}
