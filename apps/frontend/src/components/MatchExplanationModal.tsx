import { useMemo } from "react";
import { Modal } from "./Modal";
import { buildMatchExplanation } from "@/utils/explain";
import type { MatchBreakdown } from "@/types";

interface MatchExplanationModalProps {
  matchScore: number;
  matchSummary: string | null;
  matchBreakdown: MatchBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
}

function seniorityBadgeColor(seniorityMatch: "exact" | "close" | "none"): string {
  switch (seniorityMatch) {
    case "exact":
      return "bg-green-100 text-green-800";
    case "close":
      return "bg-yellow-100 text-yellow-800";
    case "none":
      return "bg-gray-100 text-gray-600";
  }
}

function seniorityBadgeLabel(seniorityMatch: "exact" | "close" | "none"): string {
  switch (seniorityMatch) {
    case "exact":
      return "Exact Match";
    case "close":
      return "Close Match";
    case "none":
      return "No Match";
  }
}

function workTypeBadgeColor(workTypeMatch: "exact" | "partial" | "none"): string {
  switch (workTypeMatch) {
    case "exact":
      return "bg-green-100 text-green-800";
    case "partial":
      return "bg-yellow-100 text-yellow-800";
    case "none":
      return "bg-gray-100 text-gray-600";
  }
}

function workTypeBadgeLabel(workTypeMatch: "exact" | "partial" | "none"): string {
  switch (workTypeMatch) {
    case "exact":
      return "Exact Match";
    case "partial":
      return "Partial Match";
    case "none":
      return "No Match";
  }
}

export function MatchExplanationModal({
  matchScore,
  matchSummary,
  matchBreakdown,
  isOpen,
  onClose,
}: MatchExplanationModalProps) {
  const explanation = useMemo(
    () => buildMatchExplanation(matchScore, matchBreakdown),
    [matchScore, matchBreakdown],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Match Score Explanation">
      {/* Score */}
      <div className="mb-4 rounded-lg bg-indigo-50 p-4 text-center">
        <div className="text-3xl font-bold text-indigo-700">
          {matchScore}%
        </div>
        <div className="mt-1 text-sm font-medium text-indigo-600">
          match
        </div>
      </div>

      {/* Explanation paragraph */}
      {explanation && (
        <p className="mb-4 text-sm leading-relaxed text-gray-700">
          {explanation}
        </p>
      )}

      {matchBreakdown ? (
        <div className="space-y-4 text-sm text-gray-700">
          {/* Matched Skills */}
          {matchBreakdown.matchedSkills.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
                Matched Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchBreakdown.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unmatched Skills */}
          {matchBreakdown.unmatchedSkills.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Unmatched Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchBreakdown.unmatchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seniority Match */}
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
            <span className="font-medium text-gray-700">Seniority Match</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${seniorityBadgeColor(matchBreakdown.seniorityMatch)}`}
              title={
                matchBreakdown.userSeniority || matchBreakdown.jobSeniority
                  ? `${matchBreakdown.userSeniority ?? "Not specified"} / ${matchBreakdown.jobSeniority ?? "Not specified"}`
                  : undefined
              }
            >
              {seniorityBadgeLabel(matchBreakdown.seniorityMatch)}
            </span>
          </div>

          {/* Work Type Match */}
          {matchBreakdown.workTypeMatch && (
            <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
              <span className="font-medium text-gray-700">Work Type Match</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${workTypeBadgeColor(matchBreakdown.workTypeMatch)}`}
              >
                {workTypeBadgeLabel(matchBreakdown.workTypeMatch)}
              </span>
            </div>
          )}

          {/* Score breakdown */}
          <div className="rounded-md bg-gray-50 px-3 py-2">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Score Breakdown
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Weighted Score</span>
                <span className="text-xs font-medium">{matchBreakdown.weightedScore.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Skill Score Contribution</span>
                <span className="text-xs font-medium">{matchBreakdown.skillScoreContribution.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Seniority Score Contribution</span>
                <span className="text-xs font-medium">{matchBreakdown.seniorityScoreContribution.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {matchSummary ? (
            <div className="rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              <span className="font-medium">Match Summary: </span>
              {matchSummary}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Detailed breakdown unavailable for this job.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
