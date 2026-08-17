const pool = require("../config/db");

// High-risk business sectors for the demo
const HIGH_RISK_SECTORS = [
  "crypto",
  "cryptocurrency",
  "money transfer",
  "financial services",
  "investment",
  "online trading",
  "gold trading"
];

const LOCATION_MISMATCH_SCORE = 40;
const HIGH_RISK_SECTOR_SCORE = 30;
const FREQUENCY_SCORE = 30;

const normalize = (value) => {
  if (!value) return "";

  return value
    .toString()
    .trim()
    .toLowerCase();
};

const analyzeRisk = async ({
  registrationId,
  pan,
  location,
  businessSector
}) => {
  let riskScore = 0;

  const reasons = [];

  // ------------------------------------------------
  // RULE 1 — LOCATION MISMATCH
  // ------------------------------------------------

  // For the current demo, Chennai is treated as the
  // registered PAN holder's expected location.
  const expectedLocation = "chennai";

  const currentLocation = normalize(location);

  if (
    currentLocation &&
    currentLocation !== expectedLocation
  ) {
    riskScore += LOCATION_MISMATCH_SCORE;

    reasons.push({
      rule: "LOCATION_MISMATCH",
      score: LOCATION_MISMATCH_SCORE,
      message: "Registration location does not match PAN holder location"
    });
  }

  // ------------------------------------------------
  // RULE 2 — HIGH-RISK BUSINESS SECTOR
  // ------------------------------------------------

  const sector = normalize(businessSector);

  const isHighRiskSector = HIGH_RISK_SECTORS.some(
    (riskSector) =>
      sector.includes(riskSector)
  );

  if (isHighRiskSector) {
    riskScore += HIGH_RISK_SECTOR_SCORE;

    reasons.push({
      rule: "HIGH_RISK_SECTOR",
      score: HIGH_RISK_SECTOR_SCORE,
      message: "Business sector is classified as high risk"
    });
  }

  // ------------------------------------------------
  // RULE 3 — SAME PAN REGISTRATION FREQUENCY
  // ------------------------------------------------

  const frequencyResult = await pool.query(
    `
    SELECT COUNT(*) AS registration_count
    FROM gst_registrations
    WHERE pan = $1
    `,
    [pan]
  );

  const registrationCount = Number(
    frequencyResult.rows[0].registration_count
  );

  // More than 3 registrations using the same PAN
  // triggers the frequency rule.
  if (registrationCount > 3) {
    riskScore += FREQUENCY_SCORE;

    reasons.push({
      rule: "PAN_FREQUENCY",
      score: FREQUENCY_SCORE,
      message: "PAN has been used for multiple GST registrations"
    });
  }

  // ------------------------------------------------
  // RISK LEVEL
  // ------------------------------------------------

  let riskLevel = "LOW";

  if (riskScore >= 70) {
    riskLevel = "HIGH";
  } else if (riskScore >= 40) {
    riskLevel = "MEDIUM";
  }

  // ------------------------------------------------
  // UPDATE DATABASE
  // ------------------------------------------------

  await pool.query(
    `
    UPDATE gst_registrations
    SET
      risk_score = $1,
      updated_at = NOW()
    WHERE id = $2
    `,
    [
      riskScore,
      registrationId
    ]
  );

  return {
    registrationId,
    riskScore,
    riskLevel,
    suspicious: riskScore >= 40,
    reasons
  };
};

module.exports = {
  analyzeRisk
};