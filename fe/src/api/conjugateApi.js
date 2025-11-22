export async function getConjugations(word, reading, partOfSpeech) {
  try {
    const payload = {
      word: word,
      reading: reading,
      part_of_speech: partOfSpeech,
    };

    const res = await fetch(
      "https://ai-dictionary-3syq.onrender.com/api/conjugate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) throw new Error("Failed to get conjugations");
    return await res.json();
  } catch (err) {
    // console.error("Lỗi khi gọi API chia từ:", err);
    throw new Error(err.message);
  }
}
