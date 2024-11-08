import { Hono } from "hono";
import { YoutubeTranscript } from "youtube-transcript";

const app = new Hono();

async function getTranscript(videoId: string) {
  try {
    console.log(`Attempting to get transcript for video ID: ${videoId}`);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // @ts-ignore
    const text = transcript.map((t) => t.text).join(" ");
    console.log(`Successfully retrieved transcript of length: ${text.length}`);
    return { transcript: text };
  } catch (error: any) {
    if (error.message.includes("TranscriptsDisabled")) {
      console.error(`Transcripts disabled for video ID: ${videoId}`);
      return {
        error:
          "Transcript not available: Subtitles are disabled for this video.",
      };
    } else {
      console.error(
        `Error getting transcript for video ID ${videoId}: ${error.message}`,
      );
      return { error: `Transcript not available: ${error.message}` };
    }
  }
}

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/transcribe/:id", async (c) => {
  const videoId = c.req.param("id");
  console.log(`Received request for video ID: ${videoId}`);

  const result = await getTranscript(videoId);

  if (result.error) {
    console.warn(`Transcript not available for video ID: ${videoId}`);
    return c.json(result, 404);
  } else {
    console.info(`Successfully retrieved transcript for video ID: ${videoId}`);
    return c.json(result);
  }
});

export default app;
