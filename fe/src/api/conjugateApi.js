export async function getConjugations(word, reading, partOfSpeech) {
  try {
    const payload = {
      word: word,
      reading: reading,
      part_of_speech: partOfSpeech,
    };

    const res = await fetch("http://localhost:8000/api/conjugate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to get conjugations");
    return await res.json();
  } catch (err) {
    // console.error("Lỗi khi gọi API chia từ:", err);
    throw new Error(err.message);
  }
}
