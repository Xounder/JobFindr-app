interface MatchSummaryProps {
  summary: string;
}

export function MatchSummary({ summary }: MatchSummaryProps) {
  return (
    <div className="mb-3 rounded-md bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
      <span className="font-medium">Match: </span>
      {summary}
    </div>
  );
}
