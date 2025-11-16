import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function convertSimpleToJishoFormat(simpleData) {
  // Tạo một cấu trúc "sense" (ý nghĩa)
  const senses = simpleData.meanings.map((meaning) => ({
    english_definitions: [meaning],
    parts_of_speech: ["Unknown"], // Thêm "Unknown" vì dữ liệu đơn giản không có
    tags: [],
    info: [],
    see_also: [],
  }));

  // Tạo đối tượng trả về giống Jisho
  return {
    slug: simpleData.word, // Dùng tạm từ làm slug
    is_common: false, // Mặc định là false
    jlpt: [], // Mặc định là rỗng
    japanese: [
      {
        word: simpleData.word,
        reading: simpleData.readings[0] || "", // Lấy cách đọc đầu tiên
      },
    ],
    senses: senses,
    attribution: {
      jmdict: true,
    },
  };
}
