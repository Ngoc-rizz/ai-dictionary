"use client";

import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrawingCanvas } from "./drawing-canvas";
import { ResultsDisplay } from "./results-display";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getWordData } from "../api/jishoApi";
import { recognizeHandwriting } from "../api/handwriting";
import { resizeImageToBase64 } from "../lib/resizeImageToBase64";

export function SearchTabs() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasTextSearched, setHasTextSearched] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [drawQuery, setDrawQuery] = useState("");
  const [drawResults, setDrawResults] = useState([]);
  const [hasDrawSearched, setHasDrawSearched] = useState(false);
  const [isDrawLoading, setIsDrawLoading] = useState(false);

  const searchInputRef = useRef(null);

  console.log("re render");
  const filterJishoData = (data) => {
    if (!data) return [];
    const cleanedData = data.map((item) => {
      if (!item.hasOwnProperty("is_common")) {
        return null;
      }
      const cleanedSenses = item.senses.filter(
        (sense) => !sense.parts_of_speech.includes("Wikipedia definition")
      );

      return { ...item, senses: cleanedSenses };
    });
    return cleanedData.filter(
      (item) => item !== null && item.senses.length > 0
    );
  };

  const handleSearch = async () => {
    const keyword = searchInputRef.current?.value.trim() || "";

    if (!keyword) {
      setSearchResults([]);
      setHasTextSearched(false);
      return;
    }

    setIsSearchLoading(true);
    setHasTextSearched(false);

    try {
      const result = await getWordData(keyword);
      setSearchResults(filterJishoData(result.data));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
      setHasTextSearched(true);
    }
  };

  const handleDrawing = async (imageDataUrl) => {
    setIsDrawLoading(true);
    setHasDrawSearched(false);
    setDrawResults([]);
    setDrawQuery("");

    try {
      const optimizedBase64 = await resizeImageToBase64(imageDataUrl, 768);

      const recogResult = await recognizeHandwriting(optimizedBase64);
      if (!recogResult) {
        throw new Error("Không thể nhận dạng ký tự.");
      }
      console.log(recogResult);

      setDrawQuery(recogResult);
      const searchResult = await getWordData(recogResult);
      setDrawResults(
        (searchResult.data || []).filter((item) =>
          item.hasOwnProperty("is_common")
        )
      );
    } catch (error) {
      // console.error("Lỗi khi nhận dạng hoặc tìm kiếm:", error);
      setDrawResults([]);
    } finally {
      setIsDrawLoading(false);
      setHasDrawSearched(true);
    }
  };

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="search" className="text-xs sm:text-sm">
          Search
        </TabsTrigger>
        <TabsTrigger value="draw" className="text-xs sm:text-sm">
          Draw Character
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="overflow-x-hidden">
        <div className="flex gap-2 overflow-x-hidden">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Enter a word"
            className="flex-1 border rounded px-2 py-1 text-sm sm:text-base"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            className="bg-blue-500 text-white px-4 py-1 rounded text-sm sm:text-base hover:bg-blue-600"
            disabled={isSearchLoading}
          >
            {isSearchLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {hasTextSearched && (
          <div className="overflow-x-hidden ">
            {searchResults.length > 0 ? (
              <div className="space-y-4 mt-5 flex justify-center">
                <ResultsDisplay results={searchResults} />
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No results found for "{searchQuery}". Try searching for
                  different words.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="draw"
        className="flex flex-col justify-center py-6 sm:py-8 space-y-6　overflow-x-hidden"
      >
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-muted-foreground text-center text-xs sm:text-sm max-w-md px-2">
            Vẽ MỘT TỪ (ví dụ: 食べる, 食べ物)
          </p>
          <DrawingCanvas onRecognize={handleDrawing} />
        </div>

        {/* Trạng thái đang tải */}
        {isDrawLoading && (
          <div className="flex justify-center items-center gap-2 text-muted-foreground pt-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang tìm kiếm...</span>
          </div>
        )}

        {/* Trạng thái đã tìm */}
        {!isDrawLoading && hasDrawSearched && (
          <div className="overflow-x-hidden ">
            {drawResults.length > 0 ? (
              <div className="space-y-4 mt-5 flex justify-center">
                <ResultsDisplay results={drawResults} />
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No results found for "{drawResults}". Try searching for
                  different words.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
