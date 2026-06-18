export default function LanguagesPage() {
  const languages = [
    "Russian",
    "French",
    "English",
    "Spanish",
    "Latin",
    "Afrikaans",
    "Swahili",
    "Chinese",
    "Yoruba",
  ];

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Languages</h1>
      <p style={{ marginBottom: 20 }}>Choose what the app can teach.</p>

      <div style={{ display: "grid", gap: 12 }}>
        {languages.map((language) => (
          <div
            key={language}
            style={{
              padding: 16,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            {language}
          </div>
        ))}
      </div>
    </main>
  );
}

