from contextlib import asynccontextmanager
from typing import List, Literal, Optional
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from agent.agentic_workflow import GraphBuilder
from starlette.responses import JSONResponse
from dotenv import load_dotenv
from pydantic import BaseModel
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Build the graph once at startup instead of on every request.
    # MemorySaver keeps each conversation's messages in memory, keyed by thread_id
    # (history is lost when the server restarts).
    graph = GraphBuilder(model_provider="groq")
    app.state.react_app = graph(checkpointer=MemorySaver())
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class QueryRequest(BaseModel):
    question: str
    thread_id: Optional[str] = None  # omit to start a new conversation
    # Earlier messages kept by the client; only used when the server has no state for
    # thread_id (e.g. after a restart, since MemorySaver lives in memory)
    history: List[ChatMessage] = []

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/query")
def query_travel_agent(query: QueryRequest):
    # Plain `def` so FastAPI runs the blocking graph call in a worker thread
    try:
        react_app = app.state.react_app
        thread_id = query.thread_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}

        messages = []
        if query.history and not react_app.get_state(config).values.get("messages"):
            messages = [
                HumanMessage(content=m.content) if m.role == "user" else AIMessage(content=m.content)
                for m in query.history
            ]
        messages.append(HumanMessage(content=query.question))

        output = react_app.invoke({"messages": messages}, config=config)

        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content  # Last AI response
        else:
            final_output = str(output)

        return {"answer": final_output, "thread_id": thread_id}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
