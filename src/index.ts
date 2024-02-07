import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import qaBot from "./bot";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
})

app.get("/", async (req: Request, res: Response) => {
  res.send("App is up and running!");
});

app.get("/test_wait", async (req: Request, res: Response) => {
  const wait = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("resolved");
    }, 3000);
  });
  res.send("App is up and running!");
});

app.post("/test_param", async (req: Request<{question: string}>, res: Response) => {
  const question = req.body.question as string;
  console.log(question)
  res.send(question);
});

app.post("/ask", async (req: Request<{question: string}>, res: Response) => {
  const question = req.body.question as string;
  const answer = await qaBot(question);
  res.send({
    "answer": answer
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});