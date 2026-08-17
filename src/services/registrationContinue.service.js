const pool = require("../config/db");

// ----------------------------------------
// CONTINUE GST REGISTRATION
// ----------------------------------------

const continueRegistration = async ({
  registrationId
}) => {
  try {
    const result = await pool.query(
      `
      UPDATE gst_registrations
      SET
        status = 'APPROVED',
        face_verified = true,
        freeze_reason = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [registrationId]
    );

    if (result.rows.length === 0) {
      throw new Error(
        "GST registration not found"
      );
    }

    const registration =
      result.rows[0];

    console.log(
      `✅ GST registration ${registrationId} approved`
    );

    return registration;

  } catch (error) {
    console.error(
      "❌ Registration continuation failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  continueRegistration
};