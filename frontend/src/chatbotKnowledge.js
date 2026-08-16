// Plain-language explanations for each stage, keyed by topic
export const chatbotKnowledge = [
  {
    keywords: ['gst', 'registration', 'register'],
    answer: 'GST registration is the first step where you submit your business details to get officially recognized under the Goods and Services Tax system.',
  },
  {
    keywords: ['pan', 'aadhaar', 'government', 'verify', 'otp'],
    answer: 'We verify your identity using your PAN and Aadhaar details, plus an OTP sent to your registered mobile number, to confirm you are who you say you are.',
  },
  {
    keywords: ['photo', 'upload', 'image'],
    answer: 'You upload a photo from your Aadhaar card. We use this once to create a secure reference of your face — the photo itself is not stored.',
  },
  {
    keywords: ['face', 'detect', 'crop'],
    answer: 'Our system automatically finds your face in the photo and focuses only on that area, ignoring the background.',
  },
  {
    keywords: ['embedding', 'reference'],
    answer: 'We convert your face into a unique numerical pattern called an embedding. This pattern is used to verify you later, without needing to store your actual photo.',
  },
  {
    keywords: ['store', 'privacy', 'discard', 'delete'],
    answer: 'For your privacy, we only keep the numerical face pattern, not your original photo. The photo is deleted right after we create the pattern.',
  },
  {
    keywords: ['risk', 'pan watch', 'scoring', 'analysis'],
    answer: 'Our fraud detection engine checks your registration against known risk patterns, like unusual timing, location, or business type, and assigns a risk score.',
  },
  {
    keywords: ['alert', 'sms', 'voice', 'call'],
    answer: 'If anything looks suspicious, we instantly alert you by SMS and voice call so you know a registration is happening under your name.',
  },
  {
    keywords: ['reply', 'yes', 'no'],
    answer: 'You can reply to our alert with YES or NO. If you don\'t reply in time, we treat it as suspicious and freeze the registration automatically.',
  },
  {
    keywords: ['camera', 'scan'],
    answer: 'If you have a camera, we ask you to do a quick live face scan to confirm it is really you. If you don\'t have a camera, we offer a phone or in-person verification instead.',
  },
  {
    keywords: ['liveness', 'blink'],
    answer: 'To make sure it is really you and not just a photo held up to the camera, we ask you to blink naturally during the scan.',
  },
  {
    keywords: ['compare', 'similarity', 'cosine', 'match'],
    answer: 'We compare the live scan of your face against the reference pattern from your Aadhaar photo. If they match closely enough, your identity is confirmed.',
  },
  {
    keywords: ['verified', 'success', 'continue'],
    answer: 'If your identity matches, your registration continues normally with no interruptions.',
  },
  {
    keywords: ['freeze', 'frozen', 'suspicious'],
    answer: 'If your identity does not match, we immediately freeze the registration to prevent fraud, and flag it for investigation.',
  },
  {
    keywords: ['complaint', 'auto-draft', 'authorities'],
    answer: 'When a registration is frozen, we automatically draft a complaint with the evidence and send it to the relevant authorities for investigation.',
  },
  {
    keywords: ['csc', 'voice', 'escalation', 'no camera'],
    answer: 'If you can\'t use a camera, our system routes you to a Common Service Centre agent or a voice-based verification process instead.',
  },
  {
    keywords: ['track', 'status', 'case'],
    answer: 'You can check the real-time status of your case anytime — whether it\'s pending, verified, or under investigation.',
  },
  {
    keywords: ['why', 'flagged', 'frozen my'],
    answer: 'Your case may have been flagged because of unusual registration activity, a mismatch during face verification, or you did not respond to our alert in time.',
  },
];

export function getChatbotResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase();

  for (const entry of chatbotKnowledge) {
    if (entry.keywords.some((kw) => lowerMsg.includes(kw))) {
      return entry.answer;
    }
  }

  return 'I\'m not sure about that yet, but I can explain GST registration, verification, alerts, face scanning, or your case status. What would you like to know?';
}
