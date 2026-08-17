export const chatbotKnowledge = [
  { keywords: ['gst', 'registration', 'register'], answer: 'GST registration is the first step where you submit your business details to get officially recognized under the Goods and Services Tax system.' },
  { keywords: ['pan', 'aadhaar', 'government', 'verify', 'otp'], answer: 'We verify your identity using your PAN and Aadhaar details, plus an OTP sent to your registered mobile number, to confirm you are who you say you are.' },
  { keywords: ['photo', 'upload', 'image'], answer: 'You upload a photo from your Aadhaar card. We use this once to create a secure reference of your face — the photo itself is not stored.' },
  { keywords: ['face', 'detect', 'crop'], answer: 'Our system automatically finds your face in the photo and focuses only on that area, ignoring the background.' },
  { keywords: ['embedding', 'reference'], answer: 'We convert your face into a unique numerical pattern (128 numbers) called an embedding. Two embeddings from the same face will be numerically close together; embeddings from different faces will be far apart. This pattern is used to verify you later, without needing to store your actual photo.' },
  { keywords: ['store', 'privacy', 'discard', 'delete'], answer: 'For your privacy, we only keep the numerical face pattern, not your original photo. The photo is deleted right after we create the pattern.' },
  { keywords: ['risk', 'pan watch', 'scoring', 'analysis'], answer: 'Our fraud detection engine checks your registration against known risk patterns, like unusual timing, location, or business type, and assigns a risk score.' },
  { keywords: ['alert', 'sms', 'voice', 'call'], answer: 'If anything looks suspicious, we instantly alert you by SMS and voice call so you know a registration is happening under your name.' },
  { keywords: ['reply', 'yes', 'no'], answer: 'You can reply to our alert with YES or NO. If you don\'t reply in time, we treat it as suspicious and freeze the registration automatically.' },
  { keywords: ['camera', 'scan'], answer: 'If you have a camera, we ask you to do a quick live face scan to confirm it is really you. If you don\'t have a camera, we offer a phone or in-person verification instead.' },
  { keywords: ['liveness', 'blink'], answer: 'To make sure it is really you and not just a photo held up to the camera, we ask you to blink naturally during the scan. We measure how your eyes normally look open, then detect a temporary dip when you blink.' },
  { keywords: ['compare', 'match', 'distance', 'threshold'], answer: 'We measure the mathematical distance between your live face pattern and your reference pattern. A small distance (close to 0) means a strong match. Our threshold is 0.55 — distances below that are treated as verified, above are treated as a possible mismatch.' },
  { keywords: ['verified', 'success', 'continue'], answer: 'If your identity matches (distance below the threshold), your registration continues normally with no interruptions.' },
  { keywords: ['freeze', 'frozen', 'suspicious'], answer: 'If your identity does not match closely enough, we immediately freeze the registration to prevent fraud, and flag it for investigation.' },
  { keywords: ['complaint', 'auto-draft', 'authorities'], answer: 'When a registration is frozen, we automatically draft a complaint including the timestamp, similarity score, and case details, and route it to the relevant authorities for investigation.' },
  { keywords: ['csc', 'escalation', 'no camera'], answer: 'If you can\'t use a camera, our system routes you to a Common Service Centre agent or a voice-based verification process instead, so verification isn\'t limited to people with smartphones or webcams.' },
  { keywords: ['exactly', 'detail', 'explain more', 'how does it work', 'technically'], answer: 'Technically: your face is converted into a 128-dimensional vector using a neural network. During verification, we compute the Euclidean distance between the live vector and the reference vector. Distances under 0.55 indicate the same person with high confidence; this is the same general approach used in production face-recognition systems like ArcFace, though we use a lighter model suited for browser-based demos.' },
];

function getContextualResponse(userMessage, caseContext) {
  const lowerMsg = userMessage.toLowerCase();
  const asksStatus = ['my status', 'my case', 'current status', 'what happened', 'my result'].some((kw) => lowerMsg.includes(kw));
  const asksWhyFlagged = ['why', 'flagged', 'frozen my', 'why was i'].some((kw) => lowerMsg.includes(kw));

  if (!caseContext) {
    if (asksStatus || asksWhyFlagged) {
      return 'You haven\'t completed a registration in this session yet, so I don\'t have any case details for you. Try the Registration Flow tab first.';
    }
    return null;
  }

  const distText = caseContext.similarity !== undefined ? caseContext.similarity.toFixed(4) : 'unknown';

  if (asksStatus) {
    return caseContext.verified
      ? 'Your registration is VERIFIED. Your live face scan matched your reference photo with a match distance of ' + distText + ' (threshold is 0.55 — lower means closer match).'
      : 'Your registration is FROZEN. Your live face scan did not match closely enough — match distance was ' + distText + ', above our 0.55 threshold.';
  }

  if (asksWhyFlagged) {
    if (caseContext.verified) {
      return 'Good news — your case was not flagged. Your identity was successfully verified with a match distance of ' + distText + ', well under our 0.55 threshold.';
    }
    return 'Your case was flagged because the live face scan did not sufficiently match your Aadhaar reference photo. The match distance was ' + distText + ', above our 0.55 threshold — meaning the two face patterns were mathematically too far apart to confidently confirm they are the same person. This can happen due to poor lighting, a different camera angle, or if someone other than the registered PAN holder attempted verification. A complaint has been auto-drafted for investigation.';
  }

  return null;
}

export function getChatbotResponse(userMessage, caseContext = null) {
  const contextualAnswer = getContextualResponse(userMessage, caseContext);
  if (contextualAnswer) return contextualAnswer;

  const lowerMsg = userMessage.toLowerCase();
  for (const entry of chatbotKnowledge) {
    if (entry.keywords.some((kw) => lowerMsg.includes(kw))) return entry.answer;
  }

  return 'I\'m not sure about that yet, but I can explain GST registration, verification, alerts, face scanning, liveness detection, or your case status in detail. What would you like to know?';
}
