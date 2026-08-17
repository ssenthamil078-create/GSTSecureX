const verifyWithGov = async (pan, aadhaarHash) => {
  console.log("Government verification started...");

  // Simulate external government API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!pan || !aadhaarHash) {
    return {
      verified: false,
      message: "PAN and Aadhaar are required"
    };
  }

  // Mock verification
  return {
    verified: true,
    message: "Government verification successful",
    verificationId: `GOV-${Date.now()}`
  };
};

module.exports = {
  verifyWithGov
};