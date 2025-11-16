export async function recognizeHandwriting(imageDataUrl) {
  try {
    const payload = {
      image_data: imageDataUrl,
    };
    const res = await fetch(
      "https://ai-dictionary-3syq.onrender.com//api/handwriting",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Lỗi nhận dạng (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (err) {
    // console.error("Lỗi trong recognizeHandwriting:", err);
    throw new Error(err.message || "Không thể kết nối đến máy chủ nhận dạng.");
  }
}
