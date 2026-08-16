const pool = require("../config/db");

const {
  freezeRegistration
} = require("./freeze.service");

const {
  createInvestigation
} = require("./investigation.service");

const {
  generateComplaint
} = require("./complaint.service");
const {
  verifyFace
} = require("./faceVerification.service");

const {
  continueRegistration
} = require("./registrationContinue.service");
// ----------------------------------------
// ROUTE CITIZEN REPLY
// ----------------------------------------

const routeReply = async ({
  alertId,
  response
}) => {
  try {
    // --------------------------------
    // Normalize response
    // --------------------------------

    const normalizedResponse = response
      ?.trim()
      .toUpperCase();

    // --------------------------------
    // Validate response
    // --------------------------------

    if (!normalizedResponse) {
      return {
        decision: "INVALID",
        message: "Response is required",
        nextStep: "WAIT_FOR_VALID_RESPONSE"
      };
    }

    // --------------------------------
    // Find alert
    // --------------------------------

    const alertResult = await pool.query(
      `
      SELECT *
      FROM alerts
      WHERE id = $1
      `,
      [alertId]
    );

    if (alertResult.rows.length === 0) {
      throw new Error("Alert not found");
    }

    const alert = alertResult.rows[0];

    // --------------------------------
    // Save citizen response
    // --------------------------------

    await pool.query(
      `
      UPDATE alerts
      SET
        status = 'REPLIED',
        citizen_response = $1,
        replied_at = NOW()
      WHERE id = $2
      `,
      [
        normalizedResponse,
        alertId
      ]
    );

    // ========================================
    // YES → FACE VERIFICATION
    // ========================================

    if (normalizedResponse === "YES") {

  // --------------------------------
  // Step 1: Get registration
  // --------------------------------

  const registrationResult =
    await pool.query(
      `
      SELECT *
      FROM gst_registrations
      WHERE id = $1
      `,
      [alert.registration_id]
    );

  if (registrationResult.rows.length === 0) {
    throw new Error(
      "GST registration not found"
    );
  }

  const registration =
    registrationResult.rows[0];

  // --------------------------------
  // Step 2: Face verification
  // --------------------------------

  const faceVerification =
    await verifyFace({
      registrationId:
        registration.id,

      userId:
        registration.user_id
    });

  // --------------------------------
  // Step 3: Verification failed
  // --------------------------------

  if (!faceVerification.verified) {
    return {
      decision: "FACE_VERIFICATION_FAILED",

      message:
        "Face verification failed",

      nextStep: "MANUAL_REVIEW",

      faceVerification
    };
  }

  // --------------------------------
  // Step 4: Continue registration
  // --------------------------------

  const approvedRegistration =
    await continueRegistration({
      registrationId:
        registration.id
    });

  // --------------------------------
  // Step 5: Return result
  // --------------------------------

  return {
    decision: "CONTINUE",

    message:
      "Citizen authorized and face verification succeeded",

    nextStep: "REGISTRATION_COMPLETED",

    faceVerification,

    registration:
      approvedRegistration
  };
}

    // ========================================
    // NO → FREEZE → INVESTIGATION → COMPLAINT
    // ========================================

    if (normalizedResponse === "NO") {

      // --------------------------------
      // Step 1: Freeze registration
      // --------------------------------

      const frozenRegistration =
        await freezeRegistration({
          registrationId:
            alert.registration_id,

          reason:
            "PAN holder denied the GST registration"
        });

      // --------------------------------
      // Step 2: Create investigation
      // --------------------------------

      const investigationResult =
        await createInvestigation({
          registrationId:
            alert.registration_id,

          reason:
            "PAN holder denied the GST registration"
        });

      const investigation =
        investigationResult.investigation;

      // --------------------------------
      // Step 3: Generate complaint
      // --------------------------------

      const complaint =
        await generateComplaint({
          investigationId:
            investigation.id
        });

      // --------------------------------
      // Return complete result
      // --------------------------------

      return {
        decision: "FREEZE",

        message:
          "Citizen denied the GST registration",

        nextStep: "INVESTIGATION",

        registration:
          frozenRegistration,

        investigation:
          complaint
      };
    }

    // ========================================
    // INVALID RESPONSE
    // ========================================

    return {
      decision: "INVALID",

      message:
        "Invalid response. Please reply YES or NO.",

      nextStep:
        "WAIT_FOR_VALID_RESPONSE"
    };

  } catch (error) {

    console.error(
      "❌ Reply router failed:",
      error.message
    );

    throw error;
  }
};

// ----------------------------------------
// EXPORT
// ----------------------------------------

module.exports = {
  routeReply
};