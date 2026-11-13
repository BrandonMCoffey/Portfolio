import { awards } from "./awards";
import { eventsAndShowcases, labTours } from "./events";
import { grants } from "./grants";
import { mediaRecognition } from "./media";
import { publications } from "./publications";

export const CV_PUBLICATION_VENUES = ["ACM", "IEEE", "ISAP", "Springer"] as const;

function parseCurrencyAmount(amount: string): number {
  const numeric = Number(amount.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMillionsShort(amount: number): string {
  const millions = Math.floor((amount / 1_000_000) * 10) / 10;
  return `$${millions}M+`;
}

export function getCvMetrics() {
  const approvedTotal = grants
    .filter((g) => g.status === "Approved")
    .reduce((sum, g) => sum + parseCurrencyAmount(g.amount), 0);

  const pendingTotal = grants
    .filter((g) => g.status === "Pending")
    .reduce((sum, g) => sum + parseCurrencyAmount(g.amount), 0);

  const combinedTotal = approvedTotal + pendingTotal;

  return {
    totalPapers: publications.length,
    totalAwards: awards.length,
    daveyAwardsCount: awards.filter((a) => a.organization === "Davey Awards").length,
    totalMedia: mediaRecognition.length,
    totalShowcases: eventsAndShowcases.length,
    totalLabTours: labTours.length,
    grants: {
      approvedNumeric: approvedTotal,
      pendingNumeric: pendingTotal,
      combinedNumeric: combinedTotal,
      approvedFormatted: formatUsd(approvedTotal),
      pendingFormatted: formatUsd(pendingTotal),
      combinedFormatted: formatUsd(combinedTotal),
      shortCombined: formatMillionsShort(combinedTotal),
    },
  };
}
