"use client";
import SonarWatchAnalyzer from "@/components/analytics/SonarWatchAnalyzer";
import RawSonarWatchAnalyzer from "@/components/analytics/RawSonarwatchAnalyzer";

export default function ApiTesterPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <RawSonarWatchAnalyzer />
    </div>
  );
}