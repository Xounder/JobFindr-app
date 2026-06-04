import { useState } from "react";
import { MatchSummary } from "./MatchSummary";
import { ExpandableDescription } from "./ExpandableDescription";
import { ApplyCta } from "./ApplyCta";
import { TrustExplanationModal } from "./TrustExplanationModal";
import { MatchExplanationModal } from "./MatchExplanationModal";
import { formatDate, formatSalary, trustLabel } from "@/utils";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const hasBreakdown = !!(job.trustBreakdown || job.matchBreakdown);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {job.trustScore !== null && (
            <button
              type="button"
              onClick={() => setShowTrustModal(true)}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-shadow hover:ring-2 focus:outline-none focus:ring-2 ${
                job.trustScore >= 9
                  ? "bg-green-100 text-green-800 hover:ring-green-400 focus:ring-green-400"
                  : job.trustScore >= 8
                    ? "bg-emerald-100 text-emerald-800 hover:ring-emerald-400 focus:ring-emerald-400"
                    : job.trustScore >= 7
                      ? "bg-blue-100 text-blue-800 hover:ring-blue-400 focus:ring-blue-400"
                      : job.trustScore >= 6
                        ? "bg-yellow-100 text-yellow-800 hover:ring-yellow-400 focus:ring-yellow-400"
                        : job.trustScore >= 5
                          ? "bg-orange-100 text-orange-800 hover:ring-orange-400 focus:ring-orange-400"
                          : "bg-red-100 text-red-800 hover:ring-red-400 focus:ring-red-400"
              } ${hasBreakdown ? "cursor-pointer" : ""}`}
              aria-label={`Trust score: ${trustLabel(job.trustScore)}. Click for details.`}
            >
              {trustLabel(job.trustScore)}
            </button>
          )}
          {job.matchScore !== null && (
            <button
              type="button"
              onClick={() => setShowMatchModal(true)}
              className={`inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 transition-shadow hover:ring-2 hover:ring-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${hasBreakdown ? "cursor-pointer" : ""}`}
              aria-label={`Match score: ${job.matchScore}%. Click for details.`}
            >
              {job.matchScore}% match
            </button>
          )}
        </div>
      </div>

      {/* Trust Explanation Modal */}
      {job.trustScore !== null && (
        <TrustExplanationModal
          trustScore={job.trustScore}
          trustLabel={trustLabel(job.trustScore)}
          trustBreakdown={job.trustBreakdown ?? null}
          isOpen={showTrustModal}
          onClose={() => setShowTrustModal(false)}
        />
      )}

      {/* Match Explanation Modal */}
      {job.matchScore !== null && (
        <MatchExplanationModal
          matchScore={job.matchScore}
          matchSummary={job.matchSummary}
          matchBreakdown={job.matchBreakdown ?? null}
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
        />
      )}

      {/* Meta */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        )}
        {job.seniority && (
          <span className="capitalize">{job.seniority}</span>
        )}
        {job.salary && (
          <span className="font-medium text-gray-700">{formatSalary(job.salary)}</span>
        )}
        {job.postedAt && (
          <span>{formatDate(job.postedAt)}</span>
        )}
        <span className="text-gray-400">{job.source}</span>
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Match Summary */}
      {job.matchSummary && <MatchSummary summary={job.matchSummary} />}

      {/* Description */}
      <ExpandableDescription description={job.description} jobTitle={job.title} />

      {/* Apply CTA */}
      <ApplyCta url={job.url} company={job.company} />
    </article>
  );
}
