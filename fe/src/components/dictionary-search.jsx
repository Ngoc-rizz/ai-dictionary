import { useState, useMemo } from "react";
import { DICTIONARY_DATA } from "@/lib/dictionary-data";

export function DictionarySearch({ onSearch }) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];

    const query = inputValue.toLowerCase();
    const matches = new Set();

    DICTIONARY_DATA.forEach((item) => {
      const word = item.japanese[0]?.word || "";
      const reading = item.japanese[0]?.reading || "";

      if (word.includes(inputValue) || reading.toLowerCase().includes(query)) {
        matches.add(`${word} (${reading})`);
      }

      item.senses.forEach((sense) => {
        sense.english_definitions.forEach((def) => {
          if (def.toLowerCase().includes(query)) {
            matches.add(def);
          }
        });
      });
    });

    return Array.from(matches).slice(0, 8);
  }, [inputValue]);

  const handleSearch = (query) => {
    setInputValue(query);
    setShowSuggestions(false);
    onSearch(query);
  };

  return (
    <div className="relative">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Enter Japanese or English word..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
            onSearch(e.target.value);
          }}
          onFocus={() => inputValue && setShowSuggestions(true)}
          className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 border border-border rounded-lg bg-popover shadow-lg z-10">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground first:rounded-t-lg last:rounded-b-lg transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
