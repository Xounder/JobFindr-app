import { useMemo } from "react";
import { Modal } from "./Modal";
import { buildTrustExplanation } from "@/utils/explain";
import type { TrustBreakdown } from "@/types";

interface TrustExplanationModalProps {
  trustScore: number;
  trustLabel: string;
  trustBreakdown: TrustBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
}

function trustScoreColor(score: number): string {
  if (score >= 9) return "text-green-700";
  if (score >= 8) return "text-emerald-700";
  if (score >= 7) return "text-blue-700";
  if (score >= 6) return "text-yellow-700";
  if (score >= 5) return "text-orange-700";
  return "text-red-700";
}

function trustScoreBg(score: number): string {
  if (score >= 9) return "bg-green-50";
  if (score >= 8) return "bg-emerald-50";
  if (score >= 7) return "bg-blue-50";
  if (score >= 6) return "bg-yellow-50";
  if (score >= 5) return "bg-orange-50";
  return "bg-red-50";
}

export function TrustExplanationModal({
  trustScore,
  trustLabel: label,
  trustBreakdown,
  isOpen,
  onClose,
}: TrustExplanationModalProps) {
  const explanation = useMemo(
    () => buildTrustExplanation(trustScore, trustBreakdown),
    [trustScore, trustBreakdown],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trust Score Explanation">
      {/* Score */}
      <div className={`mb-4 rounded-lg p-4 text-center ${trustScoreBg(trustScore)}`}>
        <div className={`text-3xl font-bold ${trustScoreColor(trustScore)}`}>
          {trustScore.toFixed(1)}
        </div>
        <div className={`mt-1 text-sm font-medium ${trustScoreColor(trustScore)}`}>
          {label}
        </div>
      </div>

      {/* Explanation paragraph */}
      {explanation && (
        <p className="mb-4 text-sm leading-relaxed text-gray-700">
          {explanation}
        </p>
      )}

      {trustBreakdown ? (
        <div className="space-y-3 text-sm text-gray-700">
          {/* Provider Score */}
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
            <span className="font-medium">Provider Score</span>
            <span className="font-semibold">{trustBreakdown.providerScore.toFixed(1)} / 10</span>
          </div>

          {/* Company Adjustment */}
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
            <span className="font-medium">Company Size Bonus</span>
            <span className={`font-semibold ${trustBreakdown.companyAdjustment >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trustBreakdown.companyAdjustment >= 0 ? "+" : ""}{trustBreakdown.companyAdjustment.toFixed(1)}
            </span>
          </div>

          {/* Freshness Score */}
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
            <span className="font-medium">Freshness Score</span>
            <span className="font-semibold">{trustBreakdown.freshnessScore.toFixed(1)} / 10</span>
          </div>

          {/* Signals Section */}
          <div className="rounded-md bg-gray-50 px-3 py-2">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Signals
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Provider Reputation</span>
                <span className="text-xs font-medium">{trustBreakdown.signals.providerReputation.toFixed(1)} / 10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Company Size Bonus</span>
                <span className={`text-xs font-medium ${trustBreakdown.signals.companySizeBonus >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {trustBreakdown.signals.companySizeBonus >= 0 ? "+" : ""}{trustBreakdown.signals.companySizeBonus.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Known Employer</span>
                <span className={`text-xs font-medium ${trustBreakdown.signals.isKnownEmployer ? "text-green-600" : "text-gray-400"}`}>
                  {trustBreakdown.signals.isKnownEmployer ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Days Since Posted</span>
                <span className="text-xs font-medium">{trustBreakdown.signals.daysSincePosted} days</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Detailed breakdown unavailable for this job.
        </p>
      )}
    </Modal>
  );
}
