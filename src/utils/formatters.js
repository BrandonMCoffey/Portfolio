import { COOKBOOK_FORMATTER_CONFIG } from "../data/cookbook";

export function formatTime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) {
    return "N/A";
  }
  const { minutesPerHour } = COOKBOOK_FORMATTER_CONFIG;
  if (totalMinutes < minutesPerHour) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / minutesPerHour);
  const minutes = totalMinutes % minutesPerHour;

  const hoursText = `${hours} hour${hours > 1 ? "s" : ""}`;
  const minutesText = minutes > 0 ? ` ${minutes} min` : "";

  return `${hoursText}${minutesText}`;
}

export function formatQuantity(quantity) {
  if (quantity === 0) return "";
  if (typeof quantity === "string") {
    const parsed = parseFloat(quantity);
    if (isNaN(parsed)) return quantity;
    quantity = parsed;
  }

  const { roundUpThreshold, roundDownThreshold, fractionTolerance, decimalPrecisionFactor, fractionMap } =
    COOKBOOK_FORMATTER_CONFIG;

  let whole = Math.floor(quantity);
  let rem = quantity - whole;

  if (rem > roundUpThreshold) {
    whole += 1;
    rem = 0;
  } else if (rem < roundDownThreshold) {
    rem = 0;
  }

  if (rem === 0) {
    return `${whole}`;
  }

  const match = fractionMap.find((f) => Math.abs(rem - f.val) < fractionTolerance);
  if (match) {
    return whole > 0 ? `${whole} ${match.char}` : match.char;
  }

  const rounded = Math.round(quantity * decimalPrecisionFactor) / decimalPrecisionFactor;
  return `${rounded}`;
}
