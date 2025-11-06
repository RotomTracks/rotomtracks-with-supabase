import { HomeContent } from "@/components/home/HomeContent";
import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col" role="main">
      <HomeNavigation />

      <div className="flex-1 flex flex-col">
        <HomeContent />
        <HomeFooter />
      </div>
    </main>
  );
}
