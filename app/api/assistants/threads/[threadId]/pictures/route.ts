import {assistantId} from "@/app/assistant-config";
import {openai} from "@/app/openai";

import fs from "fs";

export const runtime = "nodejs";

// Send a new message to a thread
export async function POST(request, {params: {threadId}}) {
    const {content} = await request.json();

    const prompt = 'Generate image of Omio';

    await openai.beta.threads.messages.create(threadId, {
        role: "assistant",
        content: "Tell me few main points that happened in this conversation.",
    });

    const stream = openai.beta.threads.runs.stream(threadId, {
        assistant_id: assistantId,
    });

    // Wait for the run to complete and extract data
    for await (const event of stream) {
        if (event.event === "thread.run.completed") {
            break;
        }
    }

    // Fetch messages after the run completes
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data.find(msg => msg.role === "assistant") as any;
    const summary = lastMessage?.content[0]?.text?.value || "";

    console.log(summary);

    // Use the summary to enhance the prompt
    const enhancedPrompt = `Generate funny picture. Player played as CEO of Omio and this happened: ${summary}`;

    const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
    });

    const image_base64 = result.data[0].b64_json;
    const image_bytes = Buffer.from(image_base64, "base64");

    // Return the image as the response
    return new Response(image_bytes, {
        headers: {
            "Content-Type": "image/png",
            "Content-Length": image_bytes.length.toString(),
        },
    });
}
