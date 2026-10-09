const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const SCRIPT = path.join(ROOT, "python", "excel_service.py");

// 가상환경(.venv)이 있으면 그 파이썬을, 없으면 PYTHON_PATH 또는 시스템 python 사용
function resolvePython() {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;
  const venv =
    process.platform === "win32"
      ? path.join(ROOT, ".venv", "Scripts", "python.exe")
      : path.join(ROOT, ".venv", "bin", "python");
  return fs.existsSync(venv) ? venv : "python";
}

/**
 * Python 엑셀 서비스를 호출한다.
 * @param {string} action  "read" | "write"
 * @param {object} payload 액션별 파라미터
 * @returns {Promise<object>} Python이 stdout으로 돌려준 JSON
 */
function callPython(action, payload = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(resolvePython(), [SCRIPT], {
      cwd: ROOT,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk) => (stdout += chunk));
    proc.stderr.on("data", (chunk) => (stderr += chunk));
    proc.on("error", reject);

    proc.on("close", (code) => {
      let result;
      try {
        result = JSON.parse(stdout);
      } catch {
        return reject(new Error(stderr || `Python 응답 파싱 실패 (exit ${code})`));
      }
      if (!result.ok) return reject(new Error(result.error));
      resolve(result.data);
    });

    proc.stdin.end(JSON.stringify({ action, ...payload }));
  });
}

module.exports = { callPython };
