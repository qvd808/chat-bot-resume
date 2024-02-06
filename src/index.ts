import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import qaBot from "./bot";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send(" + TypeScript Server");
});

app.get("/ask", async (req: Request, res: Response) => {
  const question = req.query.question as string;
  const answer = await qaBot(question);
  res.send({
    "answer": answer
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});