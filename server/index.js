const express = require("express");
const { callPython } = require("./pythonBridge");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// 엑셀 파일 읽기: { file, sheet? }
app.post("/api/read", async (req, res) => {
  try {
    const data = await callPython("read", req.body);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 엑셀 파일 쓰기: { file, sheet?, rows: [[...], ...] }
app.post("/api/write", async (req, res) => {
  try {
    const data = await callPython("write", req.body);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
