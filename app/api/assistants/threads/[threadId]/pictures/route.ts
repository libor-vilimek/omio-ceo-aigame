import {assistantId} from "@/app/assistant-config";
import {openai} from "@/app/openai";
import {superCache, isProcessing} from "@/app/utils/supercache";

export const runtime = "nodejs";

// Send a new message to a thread
export async function GET(request, {params: {threadId}}) {
    return new Response();

    superCache.forEach((key) => console.log(`Cache key: ${key}`));
    isProcessing.forEach((key) => console.log(`Processing key: ${key}`));

    const byteCache = superCache.get(threadId);
    if (byteCache) {
        console.log('Hit byteCache');
        return new Response(byteCache, {
            headers: {
                "Content-Type": "image/png",
                "Content-Length": byteCache.length.toString(),
            },
        });
    }

    const isThreadProcessing = isProcessing.get(threadId);
    if (isThreadProcessing) {
        console.log('returned null -> processing')
        return new Response();
    }
    isProcessing.set(threadId, true);

    await openai.beta.threads.messages.create(threadId, {
        role: "assistant",
        content: "Tell me few main points that happened in this conversation. Tell how much months I survived.",
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

    // Use the summary to enhance the prompt
    const enhancedPrompt = `Generate funny picture. 
    Add badge "Survived for X months" -> Replace the X with number (the months survived is part of this prompt later)
    Player played as CEO of Omio and this happened: ${summary}`;

    console.log(enhancedPrompt);

    const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        quality: 'high',
    });

    const image_base64 = result.data[0].b64_json;
    const image_bytes = Buffer.from(image_base64, "base64");
    superCache.set(threadId, image_bytes);

    console.log('finished image generation');

    // Return the image as the response
    return new Response(image_bytes, {
        headers: {
            "Content-Type": "image/png",
            "Content-Length": image_bytes.length.toString(),
        },
    });
}
