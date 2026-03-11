require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Document = require("./models/Document");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // Will update this when frontend URL is sorted
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a document room
  socket.on("join-document", async (documentId) => {
    socket.join(documentId);
    console.log(`Socket ${socket.id} joined document: ${documentId}`);
    
    // Fetch document and send to the user immediately
    try {
      const document = await Document.findById(documentId);
      if (document) {
        socket.emit("load-document", document.content || "");
      } else {
        socket.emit("load-document", "");
      }
    } catch (err) {
      console.error("Error loading doc on join:", err);
      socket.emit("load-document", "");
    }

    // Listen to incoming changes from the client and broadcast to everyone else in the room
    socket.on("send-changes", (delta) => {
      // Broadcast to everyone else in the document room
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    // Auto-save: client periodically sends save-document event
    socket.on("save-document", async (content) => {
      try {
        await Document.findByIdAndUpdate(documentId, { content });
      } catch (err) {
        console.error("Error saving doc:", err);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection Error: ", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("Collaboration Platform API");
});

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/documents", require("./routes/documents"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
