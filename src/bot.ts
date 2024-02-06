import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { config } from "dotenv";
config();

const qaBot = async (question_input: string) => {
  /* Initialize the LLM to use to answer the question */
  const model = new ChatOpenAI({temperature: 0});
  /* Load in the file we want to do question answering over */
  const text = fs.readFileSync("./data/chatbot.txt", "utf8");
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  const retriever = vectorStore.asRetriever();

  // const formatChatHistory = (
  //   human: string,
  //   ai: string,
  //   previousChatHistory?: string
  // ) => {
  //   const newInteraction = `Human: ${human}\nAI: ${ai}`;
  //   if (!previousChatHistory) {
  //     return newInteraction;
  //   }
  //   return `${previousChatHistory}\n\n${newInteraction}`;
  // };

  /**
   * Create a prompt template for generating an answer based on context and
   * a question.
   *
   * Chat history will be an empty string if it's the first question.
   *
   * inputVariables: ["chatHistory", "context", "question"]
   */
  const questionPrompt = PromptTemplate.fromTemplate(
    `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  CONTEXT: {context}
  ----------------
  QUESTION: {question}
  ----------------
  Helpful Answer:`
  );

  const chain = RunnableSequence.from([
    {
      question: (input: { question: string; chatHistory?: string }) =>
        input.question,
      chatHistory: (input: { question: string; chatHistory?: string }) =>
        input.chatHistory ?? "",
      context: async (input: { question: string; chatHistory?: string }) => {
        const relevantDocs = await retriever.getRelevantDocuments(
          input.question
        );
        const serialized = formatDocumentsAsString(relevantDocs);
        return serialized;
      },
    },
    questionPrompt,
    model,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke({
    question: question_input,
  });

  return answer;
};

export default qaBot;
