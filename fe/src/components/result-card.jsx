"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { generateExamplesForSense } from "../api/jishoApi";
import { ChevronDown, ChevronUp, Loader2, Activity } from "lucide-react";
import FuriganaText from "./ui/furigana-text";
import { getConjugations } from "../api/conjugateApi";

const conjugationMap = {
  dictionary: "Thể từ điển (V-ru)",
  masu: "Thể lịch sự (V-masu)",
  nai: "Thể phủ định (V-nai)",
  te: "Thể Te (V-te)",
  ta: "Thể quá khứ (V-ta)",
  potential: "Thể khả năng (V-eru)",
  passive: "Thể bị động (V-areru)",
  volitional: "Thể ý định (V-you)",
  imperative: "Thể mệnh lệnh",
  prohibitive: "Thể cấm chỉ (V-na)",
  conditional_ba: "Thể điều kiện (V-eba)",
  causative: "Thể sai khiến",
};

function SenseItem({ sense, index, wordData, onRelatedWordClick }) {
  const [example, setExample] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  async function handleGenerateExample() {
    setIsLoading(true);
    setError(null);
    setExample(null);

    const japanese = wordData.japanese[0] || {};
    const jlptLevel =
      wordData.jlpt && wordData.jlpt.length > 0
        ? wordData.jlpt[0].replace("jlpt-", "").toUpperCase()
        : null;

    try {
      const result = await generateExamplesForSense({
        word: japanese.word || "",
        reading: japanese.reading || "",
        level: jlptLevel || null,
        sense: sense,
      });

      setExample(result);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-2 mb-2">
        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {index}
        </span>
        <div className="flex gap-2 flex-wrap">
          {sense.parts_of_speech?.map((pos, posIdx) => (
            <Badge key={posIdx} variant="secondary" className="text-xs">
              {pos}
            </Badge>
          ))}
        </div>
      </div>

      <div className="pl-8">
        <ol className="text-left list-decimal list-inside space-y-1 mb-3 text-sm sm:text-base">
          {sense.english_definitions.map((def, defIdx) => (
            <li key={defIdx}> {def}</li>
          ))}
        </ol>

        {sense.tags && sense.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {sense.tags.map((tag, tagIdx) => (
              <Badge
                key={tagIdx}
                variant="outline"
                className="text-xs text-orange-500 border-orange-300 dark:text-orange-300 dark:border-orange-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Info (Ghi chú thêm) */}
        {sense.info && sense.info.length > 0 && (
          <div className="mb-3 text-xs sm:text-sm text-muted-foreground italic space-y-1">
            {sense.info.map((info, infoIdx) => (
              <p key={infoIdx}>※ {info}</p>
            ))}
          </div>
        )}

        {sense.see_also && sense.see_also.length > 0 && (
          <div className="text-xs sm:text-sm">
            <p className="font-medium text-muted-foreground mb-1">See also:</p>
            <div className="flex gap-1 flex-wrap">
              {sense.see_also.map((related, relatedIdx) => (
                <button
                  key={relatedIdx}
                  type="button"
                  onClick={() => onRelatedWordClick(related)}
                  className="px-2 py-1 bg-muted rounded text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  {related}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4">
          {/* Nút bấm */}
          {!example && !isLoading && (
            <button
              onClick={handleGenerateExample}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Lấy ví dụ
            </button>
          )}

          {/* Trạng thái Loading */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs italic text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Đang tạo ví dụ...</span>
            </div>
          )}

          {/* Trạng thái Lỗi */}
          {error && <div className="text-sm text-red-500">Lỗi: {error}</div>}

          {example && (
            <div className="p-3 bg-muted rounded-md space-y-2 mt-2 text-left">
              {/* Dòng này bây giờ đã an toàn */}
              <FuriganaText text={example.sentence} />

              <p className="italic text-muted-foreground pt-1">
                {example.translation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function PitchAccentDisplay({ reading, pattern }) {
  // Chỉ render nếu dữ liệu khớp (số ký tự = số mẫu L/H)
  if (!reading || !pattern || reading.length !== pattern.length) {
    return null;
  }

  const moras = reading.split(""); // ["た", "べ", "る"]
  const tones = pattern.split(""); // ["L", "H", "H"]

  // Mảng 'elements' sẽ lưu kết quả
  const elements = [];

  // 1. Thêm Mora (âm tiết) đầu tiên
  elements.push(
    <span key={0} className="text-lg text-muted-foreground">
      {moras[0]}
    </span>
  );

  // 2. Lặp qua các Mora còn lại để thêm KÝ TỰ CHUYỂN TIẾP
  for (let i = 1; i < moras.length; i++) {
    const prevTone = tones[i - 1]; // Âm trước
    const currTone = tones[i]; // Âm hiện tại

    let transitionSymbol = "—"; // Mặc định là bằng (flat)

    if (prevTone === "L" && currTone === "H") {
      transitionSymbol = "/"; // Lên (Low -> High)
    } else if (prevTone === "H" && currTone === "L") {
      transitionSymbol = "\\"; // Xuống (High -> Low)
    }

    // Thêm ký tự chuyển tiếp
    elements.push(
      <span key={`t-${i}`} className="mx-1 text-primary font-bold">
        {transitionSymbol}
      </span>
    );

    // Thêm Mora tiếp theo
    elements.push(
      <span key={i} className="text-lg text-muted-foreground">
        {moras[i]}
      </span>
    );
  }

  return (
    <div className="flex items-center" aria-label={`Pitch accent: ${pattern}`}>
      {elements}
    </div>
  );
}

export function ResultCard({ data, onRelatedWordClick = () => {} }) {
  const japanese = data.japanese[0] || {};
  const isCommon = data.is_common;
  const jlptLevel =
    data.jlpt && data.jlpt.length > 0
      ? data.jlpt[0].replace("jlpt-", "").toUpperCase()
      : null;
  const pitchPattern = data.pitch_pattern;

  const [conjOpen, setConjOpen] = useState(false);
  const [conjugationData, setConjugationData] = useState(null);
  const [isConjLoading, setIsConjLoading] = useState(false);
  const [conjError, setConjError] = useState(null);
  const verbSense = data.senses.find((s) =>
    s.parts_of_speech?.some((p) => p.toLowerCase().includes("verb"))
  );
  const isVerb = !!verbSense;

  const handleFetchConjugations = async () => {
    setIsConjLoading(true);
    setConjError(null);
    setConjugationData(null);

    try {
      const partOfSpeech = verbSense.parts_of_speech.find((p) =>
        p.toLowerCase().includes("verb")
      );
      const result = await getConjugations(
        japanese.word || japanese.reading,
        japanese.reading,
        partOfSpeech
      );
      setConjugationData(result);
    } catch (err) {
      setConjError(err.message || "Không thể tải cách chia từ.");
    } finally {
      setIsConjLoading(false);
    }
  };
  return (
    <Card className="p-6 bg-card shadow-sm hover:shadow-md transition rounded-lg relative">
      <div className="rounded-b-lg flex flex-col justify-around absolute w-full bottom-0 h-fit py-1 left-0  bg-[#1a1a1a] shadow-[-2px_0_10px_rgba(255,255,255,0.1)]">
        {isVerb && (
          <button
            className="h-full flex items-center justify-center"
            onClick={() => {
              setConjOpen((v) => !v);
              handleFetchConjugations();
            }}
          >
            <div className="flex justify-center items-center gap-2">
              <span className=" inline-block">Conjugations</span>
              <ChevronUp
                className={`transition-transform duration-200 ${
                  conjOpen ? "rotate-180" : "rotate-0"
                }`}
                size={16}
              />
            </div>
          </button>
        )}
      </div>
      <div className="flex">
        {isVerb && (
          <div className="shrink-0 bg-transparent">
            {conjOpen && (
              <div
                onClick={() => setConjOpen(false)}
                className="absolute inset-0 bg-black/40 z-10 transition-opacity"
              />
            )}
            <div
              className={`absolute overflow-auto left-0 right-0 bottom-0 z-30 transform h-full  transition-transform duration-300 ease-in-out  backdrop-blur-lg  ${
                conjOpen ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className=" bg-gradient-to-top from-[#0b0b0b] to-transparent border-t border-border p-4 overflow-auto">
                <button
                  onClick={() => setConjOpen(false)}
                  className="w-full flex justify-center py-2 mb-2  bg-transparent! text-muted-foreground hover:text-white transition"
                >
                  <ChevronDown size={20} />
                </button>

                <h4 className="text-lg font-semibold mb-3">
                  Danh sách các thể
                </h4>
                {isConjLoading && (
                  <div className="flex items-center gap-2 text-xs italic text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                )}
                {!isConjLoading && conjugationData && (
                  <ul className="space-y-2 text-sm">
                    {conjugationData && (
                      <div className="overflow-auto rounded-md">
                        <table className="w-full text-sm border-collapse text-left">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium text-muted-foreground">
                                Thể (Form)
                              </th>
                              <th className="text-left p-2 font-medium text-muted-foreground">
                                Cách chia thể
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(conjugationData).map(
                              ([key, value]) => (
                                <tr
                                  key={key}
                                  className="border-b border-border/50"
                                >
                                  <td className="p-2">
                                    {conjugationMap[key] || key}
                                  </td>
                                  <td className="p-2 font-medium text-lg text-left">
                                    {value}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="w-full lg:text-left text-center">
              <h3 className="text-4xl font-bold text-foreground">
                <ruby>
                  {japanese.word}
                  <rt className="text-base font-medium text-muted-foreground select-none">
                    {japanese.reading}
                  </rt>
                </ruby>
              </h3>
              {pitchPattern && (
                <div className="mt-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>:</span>
                  <PitchAccentDisplay
                    reading={japanese.reading}
                    pattern={pitchPattern}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {isCommon && (
                <Badge className="bg-primary text-primary-foreground text-sm">
                  Common
                </Badge>
              )}
              {jlptLevel && (
                <Badge className="bg-accent text-accent-foreground text-sm">
                  {jlptLevel}
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {data.senses.map((sense, idx) => (
              <SenseItem
                key={idx}
                sense={sense}
                index={idx + 1}
                wordData={data}
                onRelatedWordClick={onRelatedWordClick}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
