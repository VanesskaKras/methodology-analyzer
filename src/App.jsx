import { useState, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `Ти — експерт з академічного оформлення студентських робіт. Проаналізуй методичку та виведи ТІЛЬКИ структуровану інформацію у форматі JSON.

Відповідай ВИКЛЮЧНО валідним JSON без жодного тексту до або після. Ніяких пояснень, ніяких \`\`\`json блоків — тільки чистий JSON.

Формат відповіді:
{
  "margins": {
    "top": "значення або 'не вказано'",
    "bottom": "значення або 'не вказано'",
    "left": "значення або 'не вказано'",
    "right": "значення або 'не вказано'",
    "note": "додаткова інформація або null"
  },
  "font": {
    "size_main": "розмір основного тексту або 'не вказано'",
    "note": "додаткова інформація або null"
  },
  "intervals": {
    "line_spacing": "міжрядковий інтервал або 'не вказано'",
    "paragraph_indent": "відступ абзацу або 'не вказано'",
    "before_heading": "відступ перед заголовком або 'не вказано'",
    "after_heading": "відступ після заголовку або 'не вказано'",
    "note": "додаткова інформація або null"
  },
  "page_numbering": {
    "position": "де розміщується або 'не вказано'",
    "first_page": "чи нумерується перша сторінка або 'не вказано'",
    "start_from": "з якої сторінки починається або 'не вказано'",
    "note": "додаткова інформація або null"
  },
  "sources": {
    "style": "стиль оформлення (ДСТУ, ГОСТ, APA тощо) або 'не вказано'",
    "order": "порядок розміщення (алфавітний, за появою тощо) або 'не вказано'",
    "in_text": "як цитувати у тексті або 'не вказано'",
    "example_1": "перший реальний приклад оформлення джерела з методички (скопіюй дослівно) або null",
    "example_2": "другий реальний приклад оформлення джерела з методички (скопіюй дослівно, інший тип джерела) або null",
    "note": "додаткова інформація або null"
  },
  "tables": {
    "caption_position": "де підпис (над/під таблицею) або 'не вказано'",
    "caption_format": "формат підпису або 'не вказано'",
    "continuation": "як переносити таблицю або 'не вказано'",
    "example": "реальний приклад підпису таблиці з методички (скопіюй дослівно) або null",
    "note": "додаткова інформація або null"
  },
  "figures": {
    "caption_position": "де підпис або 'не вказано'",
    "caption_format": "формат підпису або 'не вказано'",
    "numbering": "система нумерації або 'не вказано'",
    "example": "реальний приклад підпису рисунку/ілюстрації з методички (скопіюй дослівно) або null",
    "note": "додаткова інформація або null"
  },
  "headings": {
    "format_h1": "оформлення заголовка 1 рівня або 'не вказано'",
    "format_h2": "оформлення заголовка 2 рівня або 'не вказано'",
    "format_h3": "оформлення заголовка 3 рівня або 'не вказано'",
    "note": "додаткова інформація або null"
  },
  "structure": {
    "required_sections": ["список обов'язкових розділів"],
    "volume": "рекомендований обсяг або 'не вказано'",
    "note": "додаткова інформація або null"
  },
  "extra": {
    "items": ["масив будь-яких важливих вимог що не увійшли вище"],
    "note": "додаткова інформація або null"
  }
}`;

const SECTION_CONFIG = [
  {
    key: "margins", icon: "⬜", title: "Поля (відступи)", color: "#4ECDC4",
    render: (d) => (
      <div className="grid-2">
        <Item label="Верхнє" value={d.top} />
        <Item label="Нижнє" value={d.bottom} />
        <Item label="Ліве" value={d.left} />
        <Item label="Праве" value={d.right} />
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "font", icon: "🔤", title: "Шрифт", color: "#FF6B6B",
    render: (d) => (
      <div className="grid-1">
        <Item label="Розмір тексту" value={d.size_main} />
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "intervals", icon: "↕️", title: "Інтервали", color: "#A78BFA",
    render: (d) => (
      <div className="grid-2">
        <Item label="Міжрядковий" value={d.line_spacing} />
        <Item label="Абзацний відступ" value={d.paragraph_indent} />
        <Item label="Перед заголовком" value={d.before_heading} />
        <Item label="Після заголовку" value={d.after_heading} />
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "page_numbering", icon: "📄", title: "Нумерація сторінок", color: "#F59E0B",
    render: (d) => (
      <div className="grid-2">
        <Item label="Розміщення" value={d.position} />
        <Item label="Перша сторінка" value={d.first_page} />
        <Item label="Починається з" value={d.start_from} />
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "sources", icon: "📚", title: "Список джерел", color: "#10B981",
    render: (d) => (
      <div className="grid-1">
        <div className="grid-2">
          <Item label="Стиль оформлення" value={d.style} />
          <Item label="Порядок" value={d.order} />
          <Item label="Цитування у тексті" value={d.in_text} span />
        </div>
        {(d.example_1 || d.example_2) && (
          <div className="examples-block">
            <div className="examples-title">📋 Приклади оформлення з методички</div>
            {d.example_1 && <ExampleBox num={1} text={d.example_1} color="#10B981" />}
            {d.example_2 && <ExampleBox num={2} text={d.example_2} color="#10B981" />}
          </div>
        )}
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "tables", icon: "📊", title: "Таблиці", color: "#3B82F6",
    render: (d) => (
      <div className="grid-1">
        <div className="grid-2">
          <Item label="Підпис (позиція)" value={d.caption_position} />
          <Item label="Формат підпису" value={d.caption_format} span />
          <Item label="Перенесення" value={d.continuation} span />
        </div>
        {d.example && (
          <div className="examples-block">
            <div className="examples-title">📋 Приклад підпису з методички</div>
            <ExampleBox num={null} text={d.example} color="#3B82F6" />
          </div>
        )}
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "figures", icon: "🖼️", title: "Рисунки та ілюстрації", color: "#EC4899",
    render: (d) => (
      <div className="grid-1">
        <div className="grid-2">
          <Item label="Підпис (позиція)" value={d.caption_position} />
          <Item label="Формат підпису" value={d.caption_format} span />
          <Item label="Нумерація" value={d.numbering} />
        </div>
        {d.example && (
          <div className="examples-block">
            <div className="examples-title">📋 Приклад підпису з методички</div>
            <ExampleBox num={null} text={d.example} color="#EC4899" />
          </div>
        )}
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "headings", icon: "📝", title: "Заголовки", color: "#F97316",
    render: (d) => (
      <div className="grid-1">
        <Item label="Заголовок 1 рівня" value={d.format_h1} />
        <Item label="Заголовок 2 рівня" value={d.format_h2} />
        <Item label="Заголовок 3 рівня" value={d.format_h3} />
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "structure", icon: "🗂️", title: "Структура роботи", color: "#6366F1",
    render: (d) => (
      <div className="grid-1">
        {d.required_sections?.length > 0 && (
          <div className="tag-list">
            <div className="tag-label">Обов'язкові розділи:</div>
            <div className="tags">
              {d.required_sections.map((s, i) => <span key={i} className="tag">{s}</span>)}
            </div>
          </div>
        )}
        <Item label="Обсяг" value={d.volume} />
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
  {
    key: "extra", icon: "💡", title: "Додаткові вимоги", color: "#14B8A6",
    render: (d) => (
      <div className="grid-1">
        {d.items?.length > 0 && (
          <ul className="extra-list">
            {d.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )}
        {d.note && <Note text={d.note} />}
      </div>
    ),
  },
];

function Item({ label, value, span }) {
  return (
    <div className={`item${span ? " span" : ""}`}>
      <span className="item-label">{label}</span>
      <span className={`item-value${value === "не вказано" ? " not-found" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function Note({ text }) {
  return (
    <div className="note">
      <span>ℹ️</span> {text}
    </div>
  );
}

function ExampleBox({ num, text, color }) {
  return (
    <div className="example-box" style={{ borderLeftColor: color }}>
      {num && <span className="example-num" style={{ color }}>Приклад {num}</span>}
      <span className="example-text">{text}</span>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const toBase64 = (f) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const analyze = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const base64 = await toBase64(f);

      // Запит іде на /api/analyze (наш Vercel бекенд) — ключ схований на сервері
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              { type: "text", text: "Проаналізуй цю методичку та надай всю необхідну інформацію про вимоги до оформлення роботи." },
            ],
          }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || err?.error || `Помилка сервера ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError(e.message || "Помилка аналізу. Спробуй ще раз.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") { setError("Завантажте PDF файл методички."); return; }
    setFile(f);
    analyze(f);
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-badge">AI Аналізатор методичок</div>
          <h1>Вимоги до <span>оформлення</span> роботи</h1>
          <p className="subtitle">
            Завантажте PDF-методичку — ШІ автоматично витягне всі правила<br />
            форматування, відступів, шрифтів та структури
          </p>
        </div>

        {!result && !loading && (
          <>
            <div
              className={`drop-zone${dragOver ? " over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current.click()}
            >
              <span className="drop-icon">📋</span>
              <div className="drop-title">Перетягніть методичку сюди</div>
              <div className="drop-sub">або оберіть файл вручну • тільки PDF</div>
              <button className="drop-btn" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
                Обрати PDF
              </button>
              <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])} />
            </div>
            {error && <div className="error-box">⚠️ {error}</div>}
          </>
        )}

        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <div className="loading-text">Аналізую методичку<span className="loading-dots" /></div>
          </div>
        )}

        {result && (
          <>
            {file && (
              <div className="file-loaded">
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name}</span>
                <span style={{ color: "#4ECDC4", fontSize: 13 }}>✓ Проаналізовано</span>
              </div>
            )}
            <div className="results">
              {SECTION_CONFIG.map((sec) => {
                const data = result[sec.key];
                if (!data) return null;
                return (
                  <div className="card" key={sec.key}>
                    <div className="card-header">
                      <div className="card-icon" style={{ background: `${sec.color}18` }}>{sec.icon}</div>
                      <div className="card-title" style={{ color: sec.color }}>{sec.title}</div>
                    </div>
                    <div className="card-body">{sec.render(data)}</div>
                  </div>
                );
              })}
            </div>
            <button className="reset-btn" onClick={() => { setResult(null); setFile(null); setError(null); }}>
              ↑ Завантажити іншу методичку
            </button>
          </>
        )}
      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Golos+Text:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0A0A0F;
    color: #E8E8F0;
    font-family: 'Golos Text', sans-serif;
    min-height: 100vh;
  }

  .app { max-width: 900px; margin: 0 auto; padding: 40px 20px 80px; }
  .header { text-align: center; margin-bottom: 48px; }
  .header-badge {
    display: inline-block;
    background: linear-gradient(135deg, #4ECDC4, #A78BFA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-family: 'Unbounded', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  h1 {
    font-family: 'Unbounded', sans-serif;
    font-size: clamp(24px, 5vw, 40px);
    font-weight: 900;
    line-height: 1.15;
    color: #fff;
    margin-bottom: 12px;
  }
  h1 span {
    background: linear-gradient(135deg, #4ECDC4 0%, #A78BFA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle { color: #8888AA; font-size: 15px; line-height: 1.6; }

  .drop-zone {
    border: 2px dashed #2A2A3E;
    border-radius: 20px;
    padding: 48px 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    background: #10101A;
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
  }
  .drop-zone:hover, .drop-zone.over { border-color: #4ECDC4; background: #0D1A1A; }
  .drop-zone::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(78,205,196,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .drop-icon { font-size: 48px; margin-bottom: 16px; display: block; }
  .drop-title { font-family: 'Unbounded', sans-serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .drop-sub { color: #666688; font-size: 13px; }
  .drop-btn {
    margin-top: 20px;
    display: inline-block;
    background: linear-gradient(135deg, #4ECDC4, #A78BFA);
    color: #0A0A0F;
    font-family: 'Unbounded', sans-serif;
    font-size: 12px;
    font-weight: 700;
    padding: 10px 24px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    letter-spacing: 1px;
  }

  .file-loaded {
    display: flex; align-items: center; gap: 12px;
    background: #13131F; border: 1px solid #2A2A3E;
    border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;
  }
  .file-name { font-size: 14px; color: #C0C0D8; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file-icon { font-size: 22px; }

  .loading-wrap { text-align: center; padding: 64px 0; }
  .spinner {
    width: 52px; height: 52px;
    border: 3px solid #1E1E30; border-top-color: #4ECDC4;
    border-radius: 50%; animation: spin 0.9s linear infinite;
    margin: 0 auto 24px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-family: 'Unbounded', sans-serif; font-size: 14px; color: #8888AA; letter-spacing: 1px; }
  .loading-dots::after { content: ''; animation: dots 1.4s infinite; }
  @keyframes dots { 0%{content:''} 33%{content:'.'} 66%{content:'..'} 100%{content:'...'} }

  .error-box {
    background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3);
    border-radius: 12px; padding: 16px 20px; color: #FF8080; font-size: 14px; margin-bottom: 24px;
  }

  .results { display: flex; flex-direction: column; gap: 20px; animation: fadeUp 0.5s ease both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .card { background: #10101A; border: 1px solid #1E1E30; border-radius: 20px; overflow: hidden; transition: border-color 0.2s; }
  .card:hover { border-color: #2E2E48; }
  .card-header { display: flex; align-items: center; gap: 14px; padding: 18px 24px; border-bottom: 1px solid #1A1A28; }
  .card-icon { font-size: 20px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; flex-shrink: 0; }
  .card-title { font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
  .card-body { padding: 20px 24px; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-1 { display: flex; flex-direction: column; gap: 12px; }
  @media (max-width: 560px) { .grid-2 { grid-template-columns: 1fr; } }

  .item { background: #0D0D18; border: 1px solid #1A1A2A; border-radius: 10px; padding: 12px 14px; }
  .item.span { grid-column: 1 / -1; }
  .item-label { display: block; font-size: 11px; font-weight: 600; color: #555570; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; }
  .item-value { display: block; font-size: 14px; color: #D0D0E8; line-height: 1.5; }
  .item-value.not-found { color: #44445A; font-style: italic; }

  .note { background: rgba(167,139,250,0.08); border: 1px solid rgba(167,139,250,0.2); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #A090CC; line-height: 1.5; }

  .tag-label { font-size: 11px; font-weight: 600; color: #555570; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag { background: #181828; border: 1px solid #282840; border-radius: 100px; padding: 5px 14px; font-size: 13px; color: #B0B0CC; }

  .extra-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .extra-list li { padding: 12px 16px 12px 44px; background: #0D0D18; border: 1px solid #1A1A2A; border-radius: 10px; font-size: 14px; color: #C0C0DA; line-height: 1.5; position: relative; }
  .extra-list li::before { content: '→'; position: absolute; left: 16px; color: #4ECDC4; font-weight: bold; }

  .examples-block { background: #0D0D18; border: 1px solid #1A1A2A; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .examples-title { font-size: 11px; font-weight: 600; color: #555570; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .example-box { border-left: 3px solid; padding: 10px 14px; background: #13131F; border-radius: 0 8px 8px 0; display: flex; flex-direction: column; gap: 4px; }
  .example-num { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .example-text { font-size: 13px; color: #C8C8E0; line-height: 1.6; font-family: 'Courier New', monospace; white-space: pre-wrap; word-break: break-word; }

  .reset-btn { display: block; margin: 32px auto 0; background: transparent; border: 1px solid #2A2A3E; color: #8888AA; font-family: 'Golos Text', sans-serif; font-size: 13px; padding: 10px 28px; border-radius: 100px; cursor: pointer; transition: all 0.2s; }
  .reset-btn:hover { border-color: #4ECDC4; color: #4ECDC4; }
`;
