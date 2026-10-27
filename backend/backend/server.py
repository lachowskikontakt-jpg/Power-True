from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Header, Query, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any
import uuid
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta

# ------------------- Setup -------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

# ------------------- Object storage -------------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "fitpulse"
storage_key = None

def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ------------------- Auth helpers -------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def public_user(u: dict) -> dict:
    return {
        "id": u["id"], "email": u["email"], "name": u.get("name"), "role": u.get("role"),
        "trainer_id": u.get("trainer_id"), "avatar_url": u.get("avatar_url"),
        "goal": u.get("goal"), "phone": u.get("phone"), "created_at": u.get("created_at"),
    }

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Brak autoryzacji")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Użytkownik nie istnieje")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token wygasł")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Nieprawidłowy token")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Brak uprawnień trenera")
    return user

def now_iso():
    return datetime.now(timezone.utc).isoformat()

# ------------------- Models -------------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    invite_code: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileIn(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class ExerciseIn(BaseModel):
    name: str
    muscle_group: str = "Inne"
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    instructions: Optional[str] = None

class PlanExercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    exercise_id: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    weight: float = 0
    sets: int = 3
    reps: int = 10
    notes: Optional[str] = None
    done: bool = False
    order: int = 0

class PlanIn(BaseModel):
    name: str
    trainee_id: Optional[str] = None
    exercises: List[PlanExercise] = []

class TrainerIn(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    hours: Optional[str] = None
    avatar_url: Optional[str] = None
    instagram: Optional[str] = None

class MessageIn(BaseModel):
    text: str
    trainee_id: Optional[str] = None

# ------------------- Auth routes -------------------
@api_router.post("/auth/register")
async def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Ten e-mail jest już zarejestrowany")
    admin = await db.users.find_one({"role": "admin"}, {"_id": 0})
    trainer_id = admin["id"] if admin else None
    user = {
        "id": str(uuid.uuid4()), "email": email, "password_hash": hash_password(data.password),
        "name": data.name, "role": "trainee", "trainer_id": trainer_id,
        "avatar_url": None, "goal": None, "phone": None, "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], email)
    return {"token": token, "user": public_user(user)}

@api_router.post("/auth/login")
async def login(data: LoginIn):
    email = data.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Nieprawidłowy e-mail lub hasło")
    token = create_access_token(user["id"], email)
    return {"token": token, "user": public_user(user)}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)

@api_router.put("/profile")
async def update_profile(data: ProfileIn, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return public_user(fresh)

# ------------------- Files -------------------
@api_router.post("/upload")
async def upload(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{user['id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = file.content_type or "application/octet-stream"
    result = put_object(path, data, content_type)
    rec = {
        "id": str(uuid.uuid4()), "storage_path": result["path"],
        "original_filename": file.filename, "content_type": content_type,
        "size": result.get("size", len(data)), "owner": user["id"],
        "is_deleted": False, "created_at": now_iso(),
    }
    await db.files.insert_one(rec)
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}

@api_router.get("/files/{path:path}")
async def download(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="Plik nie znaleziony")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))

# ------------------- Exercises (Atlas) -------------------
@api_router.get("/exercises")
async def list_exercises(user: dict = Depends(get_current_user)):
    items = await db.exercises.find({"is_deleted": {"$ne": True}}, {"_id": 0}).sort("name", 1).to_list(1000)
    return items

@api_router.post("/exercises")
async def create_exercise(data: ExerciseIn, user: dict = Depends(require_admin)):
    ex = data.model_dump()
    ex.update({"id": str(uuid.uuid4()), "created_by": user["id"], "is_deleted": False, "created_at": now_iso()})
    await db.exercises.insert_one(ex)
    return {k: v for k, v in ex.items() if k != "_id"}

@api_router.put("/exercises/{ex_id}")
async def update_exercise(ex_id: str, data: ExerciseIn, user: dict = Depends(require_admin)):
    existing = await db.exercises.find_one({"id": ex_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Ćwiczenie nie znalezione")
    await db.exercises.update_one({"id": ex_id}, {"$set": data.model_dump()})
    fresh = await db.exercises.find_one({"id": ex_id}, {"_id": 0})
    return fresh

@api_router.delete("/exercises/{ex_id}")
async def delete_exercise(ex_id: str, user: dict = Depends(require_admin)):
    await db.exercises.update_one({"id": ex_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ------------------- Plans -------------------
async def can_access_plan(plan: dict, user: dict) -> bool:
    if user["role"] == "admin":
        return True
    return plan.get("trainee_id") == user["id"]

@api_router.get("/plans")
async def list_plans(trainee_id: Optional[str] = Query(None), user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        q = {"trainee_id": trainee_id} if trainee_id else {"trainee_id": user["id"]}
    else:
        q = {"trainee_id": user["id"]}
    q["is_deleted"] = {"$ne": True}
    plans = await db.plans.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return plans

@api_router.get("/plans/{plan_id}")
async def get_plan(plan_id: str, user: dict = Depends(get_current_user)):
    plan = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    if not plan or not await can_access_plan(plan, user):
        raise HTTPException(status_code=404, detail="Plan nie znaleziony")
    return plan

@api_router.post("/plans")
async def create_plan(data: PlanIn, user: dict = Depends(get_current_user)):
    trainee_id = data.trainee_id if (user["role"] == "admin" and data.trainee_id) else user["id"]
    exercises = [e.model_dump() for e in data.exercises]
    for i, e in enumerate(exercises):
        e["order"] = i
    plan = {
        "id": str(uuid.uuid4()), "name": data.name, "trainee_id": trainee_id,
        "created_by": user["id"], "exercises": exercises,
        "is_deleted": False, "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.plans.insert_one(plan)
    return {k: v for k, v in plan.items() if k != "_id"}

@api_router.put("/plans/{plan_id}")
async def update_plan(plan_id: str, data: PlanIn, user: dict = Depends(get_current_user)):
    plan = await db.plans.find_one({"id": plan_id})
    if not plan or not await can_access_plan(plan, user):
        raise HTTPException(status_code=404, detail="Plan nie znaleziony")
    exercises = [e.model_dump() for e in data.exercises]
    for i, e in enumerate(exercises):
        e["order"] = i
    updates = {"name": data.name, "exercises": exercises, "updated_at": now_iso()}
    if user["role"] == "admin" and data.trainee_id:
        updates["trainee_id"] = data.trainee_id
    await db.plans.update_one({"id": plan_id}, {"$set": updates})
    fresh = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    return fresh

@api_router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: str, user: dict = Depends(get_current_user)):
    plan = await db.plans.find_one({"id": plan_id})
    if not plan or not await can_access_plan(plan, user):
        raise HTTPException(status_code=404, detail="Plan nie znaleziony")
    await db.plans.update_one({"id": plan_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}

@api_router.post("/plans/{plan_id}/log")
async def log_session(plan_id: str, user: dict = Depends(get_current_user)):
    plan = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    if not plan or not await can_access_plan(plan, user):
        raise HTTPException(status_code=404, detail="Plan nie znaleziony")
    date = now_iso()
    logs = []
    for e in plan.get("exercises", []):
        volume = float(e.get("weight", 0)) * int(e.get("sets", 0)) * int(e.get("reps", 0))
        logs.append({
            "id": str(uuid.uuid4()), "plan_id": plan_id, "trainee_id": plan["trainee_id"],
            "exercise_name": e["name"], "weight": e.get("weight", 0),
            "sets": e.get("sets", 0), "reps": e.get("reps", 0), "volume": volume, "date": date,
        })
    if logs:
        await db.progress_logs.insert_many(logs)
    return {"ok": True, "logged": len(logs)}

@api_router.get("/progress")
async def get_progress(trainee_id: Optional[str] = Query(None), user: dict = Depends(get_current_user)):
    tid = trainee_id if (user["role"] == "admin" and trainee_id) else user["id"]
    logs = await db.progress_logs.find({"trainee_id": tid}, {"_id": 0}).sort("date", 1).to_list(5000)
    return logs

# ------------------- Trainees (admin) -------------------
@api_router.get("/trainees")
async def list_trainees(user: dict = Depends(require_admin)):
    trainees = await db.users.find({"role": "trainee"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    result = []
    for t in trainees:
        plan_count = await db.plans.count_documents({"trainee_id": t["id"], "is_deleted": {"$ne": True}})
        sessions = await db.progress_logs.distinct("date", {"trainee_id": t["id"]})
        t["plan_count"] = plan_count
        t["session_count"] = len(sessions)
        result.append(t)
    return result

@api_router.get("/trainees/{trainee_id}")
async def get_trainee(trainee_id: str, user: dict = Depends(require_admin)):
    t = await db.users.find_one({"id": trainee_id, "role": "trainee"}, {"_id": 0, "password_hash": 0})
    if not t:
        raise HTTPException(status_code=404, detail="Podopieczny nie znaleziony")
    plans = await db.plans.find({"trainee_id": trainee_id, "is_deleted": {"$ne": True}}, {"_id": 0}).to_list(1000)
    logs = await db.progress_logs.find({"trainee_id": trainee_id}, {"_id": 0}).sort("date", 1).to_list(5000)
    return {"trainee": t, "plans": plans, "logs": logs}

# ------------------- Trainer profile -------------------
@api_router.get("/trainer")
async def get_trainer(user: dict = Depends(get_current_user)):
    settings = await db.settings.find_one({"key": "trainer"}, {"_id": 0})
    if not settings:
        return {}
    return settings.get("value", {})

@api_router.put("/trainer")
async def update_trainer(data: TrainerIn, user: dict = Depends(require_admin)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    existing = await db.settings.find_one({"key": "trainer"})
    value = (existing or {}).get("value", {})
    value.update(updates)
    await db.settings.update_one({"key": "trainer"}, {"$set": {"value": value}}, upsert=True)
    return value

# ------------------- Chat -------------------
@api_router.get("/messages")
async def get_messages(trainee_id: Optional[str] = Query(None), user: dict = Depends(get_current_user)):
    tid = trainee_id if (user["role"] == "admin" and trainee_id) else user["id"]
    msgs = await db.messages.find({"trainee_id": tid}, {"_id": 0}).sort("created_at", 1).to_list(2000)
    return msgs

@api_router.post("/messages")
async def send_message(data: MessageIn, user: dict = Depends(get_current_user)):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Wiadomość jest pusta")
    if user["role"] == "admin":
        if not data.trainee_id:
            raise HTTPException(status_code=400, detail="Brak podopiecznego")
        tid = data.trainee_id
    else:
        tid = user["id"]
    msg = {
        "id": str(uuid.uuid4()), "trainee_id": tid, "sender_id": user["id"],
        "sender_role": user["role"], "sender_name": user.get("name"),
        "text": data.text, "created_at": now_iso(),
    }
    await db.messages.insert_one(msg)
    return {k: v for k, v in msg.items() if k != "_id"}

@api_router.get("/conversations")
async def conversations(user: dict = Depends(require_admin)):
    trainees = await db.users.find({"role": "trainee"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    result = []
    for t in trainees:
        last = await db.messages.find({"trainee_id": t["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1)
        count = await db.messages.count_documents({"trainee_id": t["id"]})
        result.append({"trainee": t, "last_message": last[0] if last else None, "message_count": count})
    result.sort(key=lambda x: (x["last_message"] or {}).get("created_at", ""), reverse=True)
    return result

# ------------------- Seed -------------------
SAMPLE_EXERCISES = [
    {"name": "Wyciskanie sztangi na ławce płaskiej", "muscle_group": "Klatka", "instructions": "Opuść sztangę do klatki, wyciśnij dynamicznie w górę.", "image_url": "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
    {"name": "Przysiad ze sztangą", "muscle_group": "Nogi", "instructions": "Zejdź do kąta prostego w kolanach, plecy proste.", "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
    {"name": "Podciąganie na drążku", "muscle_group": "Plecy", "instructions": "Podciągnij brodę ponad drążek, kontroluj opuszczanie.", "image_url": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
    {"name": "Uginanie ramion ze sztangą", "muscle_group": "Ramiona", "instructions": "Łokcie przy tułowiu, kontrolowany ruch.", "image_url": "https://images.unsplash.com/photo-1641337221253-fdc7237f6b61?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
    {"name": "Martwy ciąg", "muscle_group": "Plecy", "instructions": "Proste plecy, napięty brzuch, prowadź sztangę blisko nóg.", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
]

@app.on_event("startup")
async def startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
    except Exception as e:
        logger.warning(f"index: {e}")
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        admin = {
            "id": str(uuid.uuid4()), "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Trener Aleksander", "role": "admin", "trainer_id": None,
            "avatar_url": "https://images.unsplash.com/photo-1577744168855-0391d2ed2b3a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
            "goal": None, "phone": None, "created_at": now_iso(),
        }
        await db.users.insert_one(admin)
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
    if not await db.settings.find_one({"key": "trainer"}):
        await db.settings.update_one({"key": "trainer"}, {"$set": {"value": {
            "name": "Trener Aleksander Kowalski",
            "bio": "Trener personalny z 10-letnim doświadczeniem. Specjalizacja: budowa siły, sylwetka i korekcja techniki.",
            "phone": "+48 600 100 200", "email": admin_email, "hours": "Pon-Pt 8:00-20:00, Sob 9:00-14:00",
            "instagram": "@trener.aleksander",
            "avatar_url": "https://images.unsplash.com/photo-1577744168855-0391d2ed2b3a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
        }}}, upsert=True)
    if await db.exercises.count_documents({}) == 0:
        admin = await db.users.find_one({"role": "admin"})
        for ex in SAMPLE_EXERCISES:
            doc = dict(ex)
            doc.update({"id": str(uuid.uuid4()), "created_by": admin["id"] if admin else None,
                        "video_url": None, "is_deleted": False, "created_at": now_iso()})
            await db.exercises.insert_one(doc)
        logger.info("Exercises seeded")
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
