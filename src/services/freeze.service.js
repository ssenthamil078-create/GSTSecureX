const pool = require("../config/db");

const freezeRegistration = async ({
  registrationId,
  reason
}) => {
  const result = await pool.query(
    `
    UPDATE gst_registrations
    SET
      status = 'FROZEN',
      freeze_reason = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [
      reason,
      registrationId
    ]
  );

  if (result.rows.length === 0) {
    throw new Error("GST registration not found");
  }

  console.log(
    `🔒 GST registration ${registrationId} frozen`
  );

  return result.rows[0];
};

module.exports = {
  freezeRegistration
};