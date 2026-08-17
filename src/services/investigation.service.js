const pool = require("../config/db");

// ----------------------------------------
// CREATE INVESTIGATION
// ----------------------------------------

const createInvestigation = async ({
  registrationId,
  reason
}) => {
  try {
    // --------------------------------
    // Check GST registration
    // --------------------------------

    const registrationResult = await pool.query(
      `
      SELECT *
      FROM gst_registrations
      WHERE id = $1
      `,
      [registrationId]
    );

    if (registrationResult.rows.length === 0) {
      throw new Error("GST registration not found");
    }

    const registration = registrationResult.rows[0];

    // --------------------------------
    // Investigation evidence
    // --------------------------------

    const evidence = {
      risk_score: registration.risk_score,
      risk_level: "HIGH",
      registration_location: registration.location,
      business_sector: registration.business_sector,
      freeze_reason: registration.freeze_reason,
      citizen_response: "NO"
    };

    // --------------------------------
    // Create investigation
    // --------------------------------

    const investigationResult = await pool.query(
      `
      INSERT INTO investigations
      (
        registration_id,
        evidence_json,
        analyst_notes
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING *
      `,
      [
        registrationId,
        JSON.stringify(evidence),
        reason
      ]
    );

    if (investigationResult.rows.length === 0) {
      throw new Error(
        "Investigation was not created"
      );
    }

    const investigation =
      investigationResult.rows[0];

    console.log(
      `🔎 Investigation created: ${investigation.id}`
    );

    return {
      investigation,
      registration
    };

  } catch (error) {
    console.error(
      "❌ Investigation service failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  createInvestigation
};