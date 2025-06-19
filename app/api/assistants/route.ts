import {openai} from "@/app/openai";
import {assistantId} from "@/app/assistant-config";

export const runtime = "nodejs";


const instructions = `
We will be playing a game.

The game is called "Omio CEO". The person who plays the role of the CEO will have to survive as long as possible by making decisions.
You will create completely crazy, finctional and unrealistic scenarios and then you will evaluate a response. Try to be funny.
The game moves by one month per decision.

You will also remember these metrics:
Number of employees: 500
Money in the bank: 10 million euroes
Number of customers: 30 millions
Monthly balance: 0 (at the beginning, the company has balanced income and expenses)

Be very cruel and harsh in your evaluations. Start soft and more and more month in a game - the more harsh you become.
When the person loses all money in the bank or loses all customers, the game is over.

The situations should be described very shortly. Do not offer any kind of solutions. Person will have to figure
it out by himself and then write you the decision.

Every month come up with new scenario. The previous scenario is always resolved (if the player used bad resolution,
the more consequences there will be)
`;

setTimeout(async () => {
    if (assistantId) {
        openai.beta.assistants.update(
            assistantId, {
                instructions,
                name: "Omio CEO",
                model: "gpt-4.1",
                tools: [
                    {type: "code_interpreter"},
                    {
                        type: "function",
                        function: {
                            name: "get_weather",
                            description: "Determine weather in my location",
                            parameters: {
                                type: "object",
                                properties: {
                                    location: {
                                        type: "string",
                                        description: "The city and state e.g. San Francisco, CA",
                                    },
                                    unit: {
                                        type: "string",
                                        enum: ["c", "f"],
                                    },
                                },
                                required: ["location"],
                            },
                        },
                    },
                    {type: "file_search"},
                ],
            })
            .catch(console.log)
            .then(() => console.log('updating assistant'))
    }
}, 5000);

// Create a new assistant
export async function POST() {
    const assistant = await openai.beta.assistants.create({
        instructions,
        name: "Omio CEO",
        model: "gpt-4.1",
        tools: [
            {type: "code_interpreter"},
            {
                type: "function",
                function: {
                    name: "get_weather",
                    description: "Determine weather in my location",
                    parameters: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description: "The city and state e.g. San Francisco, CA",
                            },
                            unit: {
                                type: "string",
                                enum: ["c", "f"],
                            },
                        },
                        required: ["location"],
                    },
                },
            },
            {type: "file_search"},
        ],
    });
    return Response.json({assistantId: assistant.id});
}
