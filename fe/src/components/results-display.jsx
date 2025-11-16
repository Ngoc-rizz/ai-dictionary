import { ResultCard } from "./result-card";

export function ResultsDisplay({ results }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No results found. Try a different search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:w-full">
      {results.map((item, idx) => (
        <ResultCard key={idx} data={item} />
      ))}
    </div>
  );
}
