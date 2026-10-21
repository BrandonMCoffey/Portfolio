export function formatTime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) {
    return "N/A";
  }
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

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

  let whole = Math.floor(quantity);
  let rem = quantity - whole;

  // Handle rounding near whole numbers
  if (rem > 0.96) {
    whole += 1;
    rem = 0;
  } else if (rem < 0.04) {
    rem = 0;
  }

  if (rem === 0) {
    return `${whole}`;
  }

  const fractionMap = [
    { val: 0.125, char: "⅛" },
    { val: 0.25, char: "¼" },
    { val: 0.333, char: "⅓" },
    { val: 0.375, char: "⅜" },
    { val: 0.5, char: "½" },
    { val: 0.625, char: "⅝" },
    { val: 0.666, char: "⅔" },
    { val: 0.75, char: "¾" },
    { val: 0.875, char: "⅞" },
  ];

  const match = fractionMap.find((f) => Math.abs(rem - f.val) < 0.04);
  if (match) {
    return whole > 0 ? `${whole} ${match.char}` : match.char;
  }

  // Fallback to cleanly rounded decimal
  const rounded = Math.round(quantity * 100) / 100;
  return `${rounded}`;
}
