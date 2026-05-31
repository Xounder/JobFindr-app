import { MatchSummary } from "./MatchSummary";
import { ExpandableDescription } from "./ExpandableDescription";
import { ApplyCta } from "./ApplyCta";
import { formatDate, formatSalary, trustLabel } from "@/utils";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
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
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                job.trustScore >= 80
                  ? "bg-green-100 text-green-800"
                  : job.trustScore >= 50
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {trustLabel(job.trustScore)}
            </span>
          )}
          {job.matchScore !== null && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
              {job.matchScore}% match
            </span>
          )}
        </div>
      </div>

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
      <ExpandableDescription description={job.description} />

      {/* Apply CTA */}
      <ApplyCta url={job.url} company={job.company} />
    </article>
  );
}
