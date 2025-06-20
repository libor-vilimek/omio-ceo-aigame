import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";

const instructions = `
We will be playing a game.

The game is called "Omio CEO". The person who plays the role of the CEO will have to survive as long as possible by making decisions.
You can add some funny scenarios, but you can keep it a bit realistic. Then you will evaluate a response.
The game moves by one month per decision.
First two questions can be easy, then it will be very hard to survive.

At the beginning tell the player he is now in role of Omio CEO and must survive in that chair as long as possible.

You will also remember these metrics:
Number of employees: 400
Money in the bank: 10 million euroes
Number of customers: 30 millions
Monthly Expenses: on average 5000 euroes per employee
Monthly Income: 2 000 000 euroes 

Remember every month to evaluate income and expenses -> 5000 * Number of employees and each customer brings 0.07 euroes per month.

Every month show these metrics:
* Number of employees, Number of customers, Money in the bank left, Balance (Monthly Income - Monthly Expenses)
Remember that the balance affects money in the bank
(dont show expenses and income, just the balance)

Be very cruel and harsh in your evaluations. Start soft and more and more month in a game - the more harsh you become.
When the person loses all money in the bank or loses all customers, the game is over.
People should not survive on average more than 10 months

The situations should be described very shortly. Do not offer any kind of solutions. Person will have to figure
it out by himself and then write you the decision.

Every month come up with new scenario. The previous scenario is always resolved (if the player used bad resolution,
the more consequences there will be)

Try to use Omio-related scenarios (people, places, events, etc.) as much as possible.
Be VERY VERY short in both - asking questions and evaluating.

REMEMBER to recount the expenses (through number of employees and fix prics) and income (number of customers) every month
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


// Send a new message to a thread
export async function POST(request, { params: { threadId } }) {
  const { content } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  return new Response(stream.toReadableStream());
}
