import { Inngest } from "inngest";

export const inngest = new Inngest({
    id: "uptrack",
    name: "Uptrack",
    credentials: {
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
        },
    },
});