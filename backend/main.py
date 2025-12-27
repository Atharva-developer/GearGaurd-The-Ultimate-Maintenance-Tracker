from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt 
from typing import Optional

# --- 1. Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./gear_guard.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. Database Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    serial_number = Column(String)
    location = Column(String)       # Maps to "Department" in your wireframe
    technician = Column(String)     # NEW
    category = Column(String)       # NEW
    employee = Column(String)       # NEW (Who uses it)

class MaintenanceRequest(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    priority = Column(String)
    request_type = Column(String)
    status = Column(String)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))

Base.metadata.create_all(bind=engine)

# --- 3. Schemas ---
class UserSignUp(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class EquipmentCreate(BaseModel):
    name: str
    serial_number: str
    location: str
    technician: str
    category: str
    employee: str

class RequestCreate(BaseModel):
    subject: str
    priority: str
    request_type: str
    equipment_id: int

class RequestUpdate(BaseModel):
    status: str

# --- 4. App Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 5. Endpoints ---

# Auth
@app.post("/signup")
def signup(user: UserSignUp, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"access_token": "fake-token-123", "token_type": "bearer", "user_name": db_user.name}

# Equipment
@app.get("/equipment/")
def get_equipment(db: Session = Depends(get_db)):
    return db.query(Equipment).all()

@app.post("/equipment/")
def create_equipment(eq: EquipmentCreate, db: Session = Depends(get_db)):
    if db.query(Equipment).filter(Equipment.serial_number == eq.serial_number).first():
         raise HTTPException(status_code=400, detail="Serial Number already exists")
    new_eq = Equipment(
        name=eq.name, serial_number=eq.serial_number, location=eq.location,
        technician=eq.technician, category=eq.category, employee=eq.employee
    )
    db.add(new_eq)
    db.commit()
    db.refresh(new_eq)
    return new_eq

@app.post("/equipment/seed")
def seed_equipment(db: Session = Depends(get_db)):
    if not db.query(Equipment).first():
        machines = [
            Equipment(name="Samsung Monitor 15\"", serial_number="MT/125/227", location="Admin", technician="Mitchell Admin", category="Monitors", employee="Tejas Modi"),
            Equipment(name="Acer Laptop", serial_number="MT/122/111", location="IT Dept", technician="Marc Demo", category="Computers", employee="Bhaumik P"),
        ]
        db.add_all(machines)
        db.commit()
        return {"message": "Dummy machines added!"}
    return {"message": "Machines already exist"}

@app.delete("/equipment/{equipment_id}")
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    db_eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(db_eq)
    db.commit()
    return {"message": "Deleted"}

# Requests
@app.get("/requests/")
def get_requests(db: Session = Depends(get_db)):
    return db.query(MaintenanceRequest).all()

@app.post("/requests/")
def create_request(req: RequestCreate, db: Session = Depends(get_db)):
    new_req = MaintenanceRequest(subject=req.subject, priority=req.priority, request_type=req.request_type, equipment_id=req.equipment_id, status="New")
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@app.put("/requests/{request_id}")
def update_request_status(request_id: int, update: RequestUpdate, db: Session = Depends(get_db)):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req: raise HTTPException(status_code=404, detail="Not found")
    req.status = update.status
    db.commit()
    return {"message": "Updated"}

# Stats
@app.get("/stats/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    active_statuses = ["New", "In Progress"]
    critical = db.query(MaintenanceRequest).filter(MaintenanceRequest.status.in_(active_statuses), MaintenanceRequest.priority == "Critical").count()
    active = db.query(MaintenanceRequest).filter(MaintenanceRequest.status.in_(active_statuses)).count()
    return {"critical_count": critical, "tech_load": f"{min(100, int((active/10)*100))}%", "open_count": active}