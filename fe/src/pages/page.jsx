import { SearchTabs } from "@/components/search-tabs";

export default function Home() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background w-screen">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 max-w-2xl mx-auto">
        <SearchTabs />
      </div>
      <button
        onClick={scrollToTop}
        className="fixed bottom-30 right-10 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </main>
  );
}
