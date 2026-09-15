export async function verifyRecaptchaToken(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return { success: true, skipped: true };
  }

  if (!token) {
    throw new Error("Please complete the security check before continuing.");
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    const errorCodes = Array.isArray(result["error-codes"]) ? result["error-codes"] : [];
    throw new Error(errorCodes[0] || "reCAPTCHA verification failed.");
  }

  return { success: true, skipped: false };
}
