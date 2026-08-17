const pool = require("../config/db");

// ----------------------------------------
// MOCK SMS PROVIDER
// ----------------------------------------

const sendMockSMS = async ({ phone, message }) => {
  console.log("=================================");
  console.log("📱 MOCK SMS");
  console.log("To:", phone);
  console.log("Message:", message);
  console.log("=================================");

  return {
    provider: "MOCK",
    messageId: `MOCK-SMS-${Date.now()}`,
    status: "SENT"
  };
};

// ----------------------------------------
// SEND PAN WATCH ALERT
// ----------------------------------------

const sendAlert = async ({
  registrationId,
  phone,
  pan
}) => {
  try {
    // --------------------------------
    // Validate input
    // --------------------------------

    if (!registrationId) {
      throw new Error(
        "Registration ID is required to create alert"
      );
    }

    if (!phone) {
      throw new Error(
        "Phone number is required to send alert"
      );
    }

    if (!pan) {
      throw new Error(
        "PAN is required to send alert"
      );
    }

    // --------------------------------
    // Create alert message
    // --------------------------------

    const message =
      `GSTSecureX PAN Watch Alert: ` +
      `A GST registration has been initiated using PAN ${pan}. ` +
      `Did you authorize this? Reply YES or NO.`;

    // --------------------------------
    // Send mock SMS
    // --------------------------------

    const smsResult = await sendMockSMS({
      phone,
      message
    });

    // --------------------------------
    // Save alert in database
    // --------------------------------

    const alertResult = await pool.query(
      `
      INSERT INTO alerts
      (
        registration_id,
        type,
        status,
        sent_at
      )
      VALUES
      (
        $1,
        'SMS',
        'SENT',
        NOW()
      )
      RETURNING *
      `,
      [registrationId]
    );

    // --------------------------------
    // Verify database insert
    // --------------------------------

    if (alertResult.rows.length === 0) {
      throw new Error(
        "Alert was not created in database"
      );
    }

    const alert = alertResult.rows[0];

    console.log(
      "✅ Alert saved successfully:",
      alert
    );

    // --------------------------------
    // Return result
    // --------------------------------

    return {
      alert,
      delivery: smsResult
    };

  } catch (error) {

    console.error(
      "❌ Alert service failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  sendAlert
};