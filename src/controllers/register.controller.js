const pool = require("../config/db");
const {
  verifyWithGov
} = require("../services/govVerification.service");
const {
  analyzeRisk
} = require("../services/riskAnalysis.service");
const{
  sendAlert
} = require("../services/alert.service");
const registerGST = async (req, res, next) => {
  try {
    const {
      full_name,
      phone,
      email,
      pan,
      aadhaar_hash,
      business_name,
      business_sector,
      ip_address,
      location
    } = req.body;

    // -----------------------------
    // 1. Validate request
    // -----------------------------

    if (!full_name || !phone || !pan || !aadhaar_hash) {
      return res.status(400).json({
        success: false,
        message:
          "full_name, phone, PAN and aadhaar_hash are required"
      });
    }

    // -----------------------------
    // 2. Government verification
    // -----------------------------

    const verification = await verifyWithGov(
      pan,
      aadhaar_hash
    );

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // -----------------------------
    // 3. Find existing user
    // -----------------------------

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE pan = $1
      `,
      [pan]
    );

    let userId;

    // -----------------------------
    // 4. Create user if needed
    // -----------------------------

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
    } else {
      const newUser = await pool.query(
        `
        INSERT INTO users
        (
          full_name,
          phone,
          email,
          pan
        )
        VALUES
        ($1, $2, $3, $4)
        RETURNING id
        `,
        [
          full_name,
          phone,
          email || null,
          pan
        ]
      );

      userId = newUser.rows[0].id;
    }

    // -----------------------------
    // 5. Create GST registration
    // -----------------------------

    const registration = await pool.query(
      `
      INSERT INTO gst_registrations
      (
        user_id,
        pan,
        aadhaar_hash,
        business_name,
        business_sector,
        ip_address,
        location,
        status,
        risk_score
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'PENDING',
        0
      )
      RETURNING *
      `,
      [
        userId,
        pan,
        aadhaar_hash,
        business_name || null,
        business_sector || null,
        ip_address || null,
        location || null
      ]
    );
    const createdRegistration = registration.rows[0];

const riskAnalysis = await analyzeRisk({
  registrationId: createdRegistration.id,
  pan: createdRegistration.pan,
  location: createdRegistration.location,
  businessSector: createdRegistration.business_sector
});

createdRegistration.risk_score =
  riskAnalysis.riskScore;
let alertResult = null;

if (riskAnalysis.suspicious) {
  alertResult = await sendAlert({
    registrationId: createdRegistration.id,
    phone,
    pan
  });
}

    // -----------------------------
    // 6. Response
    // -----------------------------

    return res.status(201).json({
  success: true,
  message: "GST registration created successfully",

  verification: {
    verified: verification.verified,
    verification_id: verification.verificationId
  },

  risk_analysis: riskAnalysis,
  alert: alertResult,

  registration: createdRegistration
});

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerGST
};