const {
  routeReply
} = require("../services/replyRouter.service");

const handleSMSReply = async (req, res, next) => {
  try {
    const {
      alert_id,
      response
    } = req.body;

    if (!alert_id || !response) {
      return res.status(400).json({
        success: false,
        message: "alert_id and response are required"
      });
    }

    const result = await routeReply({
      alertId: alert_id,
      response
    });

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleSMSReply
};