export let assistantId = "asst_C1dNSApNDI0cXeF5kPs79lQY"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
