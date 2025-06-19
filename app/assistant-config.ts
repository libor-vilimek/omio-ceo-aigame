export let assistantId = "asst_fchiRuEOdLmfU5ZarQ98oYYi\n"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
