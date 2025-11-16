const cache = new Map();

export async function getWordData(word) {
  if (!word || word.trim() === "") return null;
  if (cache.has(word)) return cache.get(word);
  // console.log(word);
  const res = await fetch(
    `https://ai-dictionary-3syq.onrender.com/api/jisho?word=${encodeURIComponent(
      word
    )}`
  );
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const data = await res.json();
  cache.set(word, data);
  // console.log(data);

  return data;
}

export async function generateExamplesForSense({
  word,
  reading,
  level,
  sense,
}) {
  try {
    const payload = {
      word,
      reading,
      level,
      sense,
    };
    // console.log(payload);
    const res = await fetch(
      "https://ai-dictionary-3syq.onrender.com/api/generate-examples",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    const exampleObject = await res.json();

    if (exampleObject && exampleObject.sentence) {
      // console.log(exampleObject);
      return exampleObject;
    } else {
      throw new Error("Invalid example object from server");
    }
  } catch (err) {
    // console.error(err);
    throw new Error(err.message || "Unknown error");
  }
}
