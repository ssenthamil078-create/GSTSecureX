const pool = require("../config/db");

const createInvestigation = async ({
  registrationId,
  reason
}) => {
  // --------------------------------
  // Check registration
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
  // Create investigation
  // --------------------------------

  const investigationResult = await pool.query(
    `
    INSERT INTO investigations
    (
      registration_id,
      status,
      reason
    )
    VALUES
    (
      $1,
      'OPEN',
      $2
    )
    RETURNING *
    `,
    [
      registrationId,
      reason
    ]
  );

  const investigation =
    investigationResult.rows[0];

  console.log(
    `🔎 Investigation created: ${investigation.id}`
  );

  return {
    investigation,
    registration
  };
};

module.exports = {
  createInvestigation
};