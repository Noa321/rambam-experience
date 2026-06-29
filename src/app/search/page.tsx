import { Metadata } from "next";
import SearchInterface from "./SearchInterface";

export const metadata: Metadata = {
  title: "Source Finder",
  description: "Ask any question and find the Rambam's ruling in the Mishneh Torah",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen pb-28">
      <SearchInterface />
    </div>
  );
}
