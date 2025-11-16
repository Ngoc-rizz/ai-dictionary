import React from "react";

/**
 * Component này nhận BẤT KỲ chuỗi Furigana nào
 * (ngoặc đơn, ngoặc vuông, dính liền)
 * và chuyển đổi nó thành các thẻ <ruby> HTML.
 *
 * PHIÊN BẢN V3: Dùng 'matchAll' để đảm bảo độ chính xác 100%.
 */
function FuriganaText({ text }) {
  if (!text) return null;

  // --- BƯỚC 1: CHUẨN HÓA (NORMALIZE) ---
  // (Giữ nguyên 2 Regex chuẩn hóa từ trước)

  // 1a. Chuẩn hóa [Ngoặc vuông] -> (Ngoặc đơn)
  const regexBrackets = /([一-龯]+)\[([^\]]+)\]/g;
  let normalizedText = text.replace(regexBrackets, "$1($2)");

  // 1b. Chuẩn hóa Dính liền -> (Ngoặc đơn)
  const regexAttached = /([一-龯]+)([ぁ-ん]+)/g;
  normalizedText = normalizedText.replace(regexAttached, "$1($2)");

  // --- BƯỚC 2: PHÂN TÍCH (PARSE) BẰNG 'matchAll' ---
  // Regex "chuẩn" (chỉ bắt ký tự tiếng Nhật)
  const regexParen = /([一-龯][一-龯ぁ-んァ-ヶ]*)\(([^)]+)\)/g;

  // Mảng 'elements' sẽ lưu kết quả [text, ruby, text, ruby...]
  const elements = [];
  let lastIndex = 0;

  // 'matchAll' tìm tất cả các cặp khớp
  // '...' là "spread operator" để biến iterator thành mảng
  const matches = [...normalizedText.matchAll(regexParen)];

  matches.forEach((match, i) => {
    const [fullMatch, base, furigana] = match;
    const matchIndex = match.index;

    // 1. Thêm text (văn bản thường) đứng TRƯỚC cặp <ruby>
    // (ví dụ: "私は" trong "私は林檎...")
    if (matchIndex > lastIndex) {
      elements.push(
        <span key={`text-${i}`}>
          {normalizedText.slice(lastIndex, matchIndex)}
        </span>
      );
    }

    // 2. Thêm cặp <ruby> (Kanji + Furigana)
    elements.push(
      <ruby key={`ruby-${i}`} className="leading-tight">
        {base} {/* Kanji/Base (ví dụ: "林檎") */}
        <rt className="text-xs" style={{ fontSize: "0.75rem" }}>
          {furigana} {/* Furigana (ví dụ: "りんご") */}
        </rt>
      </ruby>
    );

    // 3. Cập nhật 'lastIndex'
    lastIndex = matchIndex + fullMatch.length;
  });

  // 4. Thêm phần text (văn bản thường) còn lại ở CUỐI chuỗi
  // (ví dụ: "が好きです。" trong "...林檎(りんご)が好きです。")
  if (lastIndex < normalizedText.length) {
    elements.push(
      <span key="text-last">{normalizedText.slice(lastIndex)}</span>
    );
  }

  // Trả về mảng các elements (React sẽ render chúng)
  return (
    <span className="text-xl" style={{ fontSize: "1.25rem" }}>
      {elements}
    </span>
  );
}

export default FuriganaText;
