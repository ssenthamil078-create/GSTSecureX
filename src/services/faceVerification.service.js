// ----------------------------------------
// MOCK FACE VERIFICATION SERVICE
// ----------------------------------------

const verifyFace = async ({
  registrationId,
  userId
}) => {
  try {
    console.log(
      "================================="
    );

    console.log("🧑 FACE VERIFICATION");

    console.log(
      "Registration ID:",
      registrationId
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "================================="
    );

    // --------------------------------
    // MOCK VERIFICATION
    // --------------------------------

    const verified = true;

    if (verified) {
      console.log(
        `✅ Face verification successful for registration ${registrationId}`
      );

      return {
        verified: true,
        verificationId:
          `FACE-${Date.now()}`,
        provider: "MOCK",
        status: "VERIFIED"
      };
    }

    console.log(
      `❌ Face verification failed for registration ${registrationId}`
    );

    return {
      verified: false,
      verificationId:
        `FACE-${Date.now()}`,
      provider: "MOCK",
      status: "FAILED"
    };

  } catch (error) {
    console.error(
      "❌ Face verification failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  verifyFace
};