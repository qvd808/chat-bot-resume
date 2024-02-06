from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
import dotenv
from flask import Flask, jsonify, request
dotenv.load_dotenv()

import os
from langchain.chat_models import ChatOpenAI
# Load the OpenAI embeddings
llm = ChatOpenAI(temperature=0,model_name="text-embedding-3-small")

from langchain.document_loaders import DirectoryLoader
data_dir = "./app/data"
pdf_loader = DirectoryLoader(data_dir, glob="**/*.pdf")
excel_loader = DirectoryLoader(data_dir, glob="**/*.txt")
word_loader = DirectoryLoader(data_dir, glob="**/*.docx")

loaders = [pdf_loader, excel_loader, word_loader]
documents = []
for loader in loaders:
    documents.extend(loader.load())

# Chunk and Embeddings
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(documents, embeddings)

# Initialise Langchain - Conversation Retrieval Chain
qa = ConversationalRetrievalChain.from_llm(ChatOpenAI(temperature=0), vectorstore.as_retriever())

app = Flask(__name__)

@app.route('/')
def default_response():
    response = {'message': 'Hello, I am a chatbot. Ask me anything!'}
    return jsonify(response)

@app.route('/ask', methods=['GET'])
def answer_question():
    arg = request.args.get('question')  
    answer = qa({
        "question": arg,
        "chat_history": (),
    })
    response = {'answer': f'{answer}'}
    return jsonify(response)

if __name__ == "__main__":
    from waitress import serve
    serve(app, port=8000)