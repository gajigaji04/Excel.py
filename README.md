# Excel Automation Program (demo)

Node.js와 Python을 함께 사용해 엑셀 파일을 읽고 쓰는 자동화 프로그램입니다.
Node.js가 API 서버 역할을 하고, 실제 엑셀 처리는 Python(`openpyxl`)이 담당합니다.

## 기능

- 엑셀 파일에 데이터를 쓰거나 읽기
- 사용자가 설정한 데이터를 엑셀 파일로 저장

## 구조

```
Excel.py/
├── server/
│   ├── index.js           # Express API 서버 (엔드포인트 정의)
│   └── pythonBridge.js    # Node → Python 호출 (child_process + JSON)
├── python/
│   ├── excel_service.py   # 엑셀 읽기/쓰기 로직 (openpyxl)
│   └── requirements.txt
├── data/                  # 엑셀 파일 입출력 폴더 (git 제외)
├── excel.py               # 초기 데모 스크립트
└── package.json
```

### 동작 방식

```
클라이언트 ──HTTP(JSON)──▶ Node (Express)
                              │  spawn + stdin(JSON)
                              ▼
                         Python (excel_service.py) ──▶ data/*.xlsx
                              │  stdout(JSON)
                              ▼
클라이언트 ◀──HTTP(JSON)── Node
```

- Node는 요청마다 `python/excel_service.py`를 실행하고, 요청 내용을 stdin으로 JSON으로 넘깁니다.
- Python은 결과를 `{"ok": true, "data": ...}` 또는 `{"ok": false, "error": "..."}` 형태로 stdout에 출력합니다.
- 파일 경로는 `data/` 폴더 기준이며, 그 밖의 경로는 거부됩니다.

## 요구 사항

- Node.js 18 이상
- Python 3.9 이상

## 설치

1. 저장소를 클론합니다:

   ```bash
   git clone https://github.com/gajigaji04/Excel.py.git
   cd Excel.py
   ```

2. Node 패키지를 설치합니다:

   ```bash
   npm install
   ```

3. Python 가상환경을 만들고 패키지를 설치합니다:

   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\pip install -r python/requirements.txt

   # macOS / Linux
   python3 -m venv .venv
   .venv/bin/pip install -r python/requirements.txt
   ```

   Windows에서는 `npm run setup:py`로 한 번에 실행할 수도 있습니다.
   `.venv`가 있으면 서버가 자동으로 그 Python을 사용합니다.

## 실행

```bash
npm start      # 일반 실행
npm run dev    # 파일 변경 시 자동 재시작
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 환경 변수

| 이름          | 기본값                             | 설명                    |
| ------------- | ---------------------------------- | ----------------------- |
| `PORT`        | `3000`                             | 서버 포트               |
| `PYTHON_PATH` | `.venv`의 Python → 없으면 `python` | 사용할 Python 실행 파일 |

## API

### `GET /api/health`

서버 상태 확인.

### `POST /api/write`

데이터를 엑셀 파일로 저장합니다.

```json
{
  "file": "people.xlsx",
  "sheet": "Sheet1",
  "rows": [
    ["Name", "Age", "Occupation"],
    ["John Doe", 30, "Engineer"],
    ["Jane Doe", 25, "Designer"]
  ]
}
```

응답:

```json
{ "ok": true, "data": { "file": "data\\people.xlsx", "rowCount": 3 } }
```

### `POST /api/read`

엑셀 파일을 읽어옵니다. `sheet`를 생략하면 활성 시트를 읽습니다.

```json
{ "file": "people.xlsx" }
```

응답:

```json
{
  "ok": true,
  "data": {
    "sheet": "Sheet1",
    "rows": [
      ["Name", "Age", "Occupation"],
      ["John Doe", 30, "Engineer"],
      ["Jane Doe", 25, "Designer"]
    ]
  }
}
```

### 호출 예시 (PowerShell)

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/write `
  -ContentType "application/json; charset=utf-8" `
  -Body '{"file":"people.xlsx","rows":[["Name","Age"],["John",30]]}'

Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/read `
  -ContentType "application/json; charset=utf-8" `
  -Body '{"file":"people.xlsx"}'
```

## 새 기능 추가하기

1. `python/excel_service.py`에 함수를 만들고 `ACTIONS`에 등록하기
2. `server/index.js`에 라우트를 추가하고 `callPython("<action>", req.body)`로 호출하기
