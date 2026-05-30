export async function runIntegrationStep(step: any, payload: any) {
  if (step.type === "SLACK_MESSAGE") {
    return {
      status: "SUCCESS",
      provider: "slack",
      message: `Message queued to #support: ${payload?.message ?? "No message provided"}`,
    };
  }

  if (step.type === "EMAIL_SEND") {
    return {
      status: "SUCCESS",
      provider: "email",
      message: `Email sent to ${payload?.to ?? "demo@example.com"}`,
    };
  }

  return {
    status: "SUCCESS",
    provider: "mock",
    message: "Step executed in mock mode",
  };
}