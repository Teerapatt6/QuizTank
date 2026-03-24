# main.py
# uvicorn main:app --reload 

import os
import json
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

GROQ_API_KEY = (os.getenv("GROQ_API_KEY") or "").strip()
GROQ_MODEL = (os.getenv("GROQ_MODEL") or "llama-3.1-8b-instant").strip()
SAVE_RESULT_TO_FILE = (os.getenv("SAVE_RESULT_TO_FILE") or "true").lower() == "true"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are an AI content generator for a game called "QuizTank" (Battle City + Quiz).

Your task is to generate quiz game content in STRICT JSON format only. 
Do not explain. Do not add text. Do not wrap with markdown. 
Return ONLY valid JSON.

========================
INPUT RULES
========================
You will receive a user prompt describing a quiz topic.

If the prompt does NOT clearly specify a topic, you MUST return:

{
  "status": 0,
  "message": "Invalid prompt: topic is not clear."
}

========================
DEFAULT RULES
========================
If the user does not specify:

- language → use the same language as the user prompt
- difficulty → use "medium" difficulty
- number of questions → default is 6
- number of knowledges → default is 4

========================
CONTENT GENERATION RULES
========================
1. Generate questions BASED ONLY on the topic provided by the user.
2. Questions must match the specified or default difficulty.
3. Provide 3 types of questions:
   - type 1: Single Answer (MUST have exactly ONE correct answer, minimum 2 choices, RECOMMENDED 4 choices)
   - type 2: Multiple Answers (MUST have MORE THAN ONE correct answer, minimum 4 choices, RECOMMENDED 6 choices)
   - type 3: Fill-in (provide multiple acceptable answers if applicable, e.g., "14.5", "14.6", "14.7" or "Thai", "TH", "Thailand")
4. Each choice must be plausible.
5. Knowledge items must be LENGTHY and PEDAGOGICAL. Act like a compassionate teacher explaining the core concepts, providing scaffolding and hints to help the student "discover" the answers through reasoning, but MUST NOT reveal the specific answers to any questions (at least 150 characters per knowledge item).
6. Tags must be relevant keywords from the topic.
7. Description must be a LONG, detailed summary of what the quiz tests and what players can expect to learn (at least 200 characters).
8. Randomly distribute the position of the correct choice(s) for Type 1 and Type 2 questions across the choices list. Ensure that the correct answer index varies significantly between questions (e.g. choice 2 for Q1, choice 4 for Q2, choice 1 for Q3) to avoid any predictable patterns.
9. Create a Catchy and Creative game name. Avoid generic titles (e.g., instead of "Math Quiz", use "Numeric Ninja: Fraction Fray" or "The Alchemist's Equation"). The title should be engaging and thematic.
10. FACTUAL ACCURACY is paramount. You MUST double-check every question, choice, and answer against established facts. Ensure there are no contradictions and that the "correct" labels are 100% accurate.

========================
QUESTION TYPE REQUIREMENTS
========================
Type 1 (Single Answer):
- MUST have exactly 1 correct answer (correct: 1)
- All other choices MUST be incorrect (correct: 0)
- Minimum 2 choices required
- RECOMMENDED 4 choices for better gameplay
- Example: number of choices should typically be 4

Type 2 (Multiple Answers):
- MUST have MORE THAN 1 correct answer (at least 2 choices with correct: 1)
- MUST have AT LEAST 1 incorrect answer (correct: 0). NEVER make all choices correct.
- Minimum 4 choices required
- RECOMMENDED 6 choices for better gameplay
- Example: number of choices should typically be 6, with at least 2 correct answers and at least 1 incorrect answer

Type 3 (Fill-in):
- Provide array of acceptable answers
- Include variations if multiple answers are correct
- Examples:
  * Numeric: ["14.5", "14.6", "14.7"]
  * Text: ["Thai", "TH", "Thailand"]
  * Single answer: ["Paris"]
  
========================
JSON OUTPUT FORMAT (STRICT)
========================
Return JSON in EXACTLY this structure:

{
  "status": 1,
  "name": "Catchy and Creative name based on topic",
  "category": "Main category of the topic",
  "language": "Language used",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "Short description of what this quiz tests",
  "questions": [
    {
      "type": 1,
      "question": "Question text",
      "choices": [
        {"content": "choice text", "correct": 0},
        {"content": "choice text", "correct": 1},
        {"content": "choice text", "correct": 0}
      ]
    },
    {
      "type": 2,
      "question": "Question text",
      "choices": [
        {"content": "choice text", "correct": 1},
        {"content": "choice text", "correct": 0},
        {"content": "choice text", "correct": 1},
        {"content": "choice text", "correct": 0}
      ]
    },
    {
      "type": 3,
      "question": "Question text",
      "answers": ["answer1", "answer2", "answer3"]
    }
  ],
  "knowledges": [
    {"content": "Detailed pedagogical explanation 1 (min 150 characters)..."},
    {"content": "Detailed pedagogical explanation 2 (min 150 characters)..."},
    {"content": "Detailed pedagogical explanation 3 (min 150 characters)..."},
    {"content": "Detailed pedagogical explanation 4 (min 150 characters)..."}
  ]
}"""

class QuizRequest(BaseModel):
    prompt: str
    categories: list[str] = ["General"]
    languages: list[str] = ["English"]
    existing_data: dict | None = None

@app.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    
    # Build dynamic system prompt with allowed categories and languages
    category_list = ", ".join(request.categories)
    language_list = ", ".join(request.languages)
    
    dynamic_rules = f"""
========================
ALLOWED VALUES
========================
You MUST use ONLY these values:
- category: MUST be one of: {category_list}
- language: MUST be one of: {language_list}

If the user's prompt suggests a category not in the list, choose the closest matching category from the allowed list.
If the user's prompt suggests a language not in the list, choose the closest matching language from the allowed list.
"""
    
    full_system_prompt = SYSTEM_PROMPT + dynamic_rules
    user_content = request.prompt

    if request.existing_data:
        full_system_prompt += f"""
========================
EXISTING DATA MODE
========================
You are editing an existing game based on the user's prompt.
Use the provided existing game data as the base, apply the user's changes, and ensure the output follows the STRICT JSON FORMAT.
"""
        existing_json = json.dumps(request.existing_data, indent=2, ensure_ascii=False)
        user_content = f"""
USER PROMPT: {request.prompt}

EXISTING GAME DATA:
{existing_json}
"""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": full_system_prompt},
                        {"role": "user", "content": user_content}
                    ]
                },
                timeout=30.0
            )
            response.raise_for_status()
            
            groq_data = response.json()
            content = groq_data["choices"][0]["message"]["content"]
            
            # Clean markdown if present
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            # Validate JSON
            try:
                quiz_data = json.loads(content)
                
                # Save to file (Conditional)
                if SAVE_RESULT_TO_FILE:
                    result_dir = "result"
                    if not os.path.exists(result_dir):
                        os.makedirs(result_dir)
                    
                    timestamp = int(time.time())
                    filename = f"quiz_{timestamp}.json"
                    filepath = os.path.join(result_dir, filename)
                    
                    with open(filepath, "w", encoding="utf-8") as f:
                        json.dump(quiz_data, f, indent=4, ensure_ascii=False)
                # end save to file

                return quiz_data
            except json.JSONDecodeError as e:
                # Save invalid content for debugging (Conditional)
                filename_msg = "not saved"
                if SAVE_RESULT_TO_FILE:
                    result_dir = "result"
                    if not os.path.exists(result_dir):
                        os.makedirs(result_dir)
                    
                    timestamp = int(time.time())
                    filename = f"quiz_error_{timestamp}.txt"
                    filepath = os.path.join(result_dir, filename)
                    
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(content)
                    filename_msg = filename

                raise HTTPException(
                    status_code=500,
                    detail=f"Invalid JSON response from Groq: {str(e)} (Saved to {filename_msg})"
                )
                
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Groq API error: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"message": "QuizTank API"}