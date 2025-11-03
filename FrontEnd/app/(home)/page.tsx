import Badge from "@/components/ui/badge";
import Herosection from "@/components/layout/herosection";

export default function Home() {
  return (
    <>
      {" "}
      {/* Make the page wrapper full width so Herosection can be full-bleed */}
      <div className="font-sans min-h-screen w-full">
        <Herosection />
      </div>
    </>
  );
}
