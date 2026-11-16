import { DeepgramClient } from "@deepgram/sdk"

import { ENV } from "./env.js"

export const deepgram = new DeepgramClient({
  apiKey: ENV.DEEPGRAM_API_KEY,
})