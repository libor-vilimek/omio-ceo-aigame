import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

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
`;

setTimeout(async () => {
  return;
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

// upload file to assistant's vector store
export async function POST(request) {
  const formData = await request.formData(); // process file as FormData
  const file = formData.get("file"); // retrieve the single file from FormData
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store

  // upload using the file stream
  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  // add file to vector store
  await openai.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id,
  });
  return new Response();
}

// list files in assistant's vector store
export async function GET() {
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  const fileList = await openai.vectorStores.files.list(vectorStoreId);

  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id);
      const vectorFileDetails = await openai.vectorStores.files.retrieve(
        vectorStoreId,
          { vector_store_id: file.id }
      );
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status,
      };
    })
  );
  return Response.json(filesArray);
}

// delete file from assistant's vector store
export async function DELETE(request) {
  const body = await request.json();
  const fileId = body.fileId;

  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  await openai.vectorStores.files.delete(vectorStoreId, fileId); // delete file from vector store

  return new Response();
}

/* Helper functions */

const getOrCreateVectorStore = async () => {
  const assistant = await openai.beta.assistants.retrieve(assistantId);

  // if the assistant already has a vector store, return it
  if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }
  // otherwise, create a new vector store and attatch it to the assistant
  const vectorStore = await openai.vectorStores.create({
    name: "sample-assistant-vector-store",
  });
  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });
  return vectorStore.id;
};
