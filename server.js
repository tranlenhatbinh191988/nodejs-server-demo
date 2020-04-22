const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors"); // Fix Access-Control-Allow-Origin error
app.use(cors());
app.get("/", (req, res) => res.send("API running"));

// Connect Database
connectDB();

// Init middleware
app.use(express.json()); // read req.body

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
