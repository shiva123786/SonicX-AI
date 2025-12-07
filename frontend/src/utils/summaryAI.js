import puter from "puter-js";

/**
 * Generates an AI-based summary for detected crowd/sound anomalies.
 * @param {Object} eventData - Data from backend (soundType, location, density, severity)
 * @returns {Promise<string>} - AI-generated summary text
 */
export async function generateAISummary(eventData) {
  try {
    const description = `
      Event detected:
      Sound Type: ${eventData.soundType}
      Location: ${eventData.location}
      Crowd Density: ${eventData.density}
      Severity Level: ${eventData.severity}
    `;

    // Use Puter.js to summarize the event in natural language
    const summary = await puter.summarize(description);
    return summary || "Summary not available.";
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    return "Unable to generate summary.";
  }
}
