from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from datetime import datetime, timedelta
from typing import Optional
import re

# --- SECURITY LIBRARIES ---
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- CONFIG ---
DATABASE_URL = "postgresql://localhost/gearguard_db"
SECRET_KEY = "mysecretkey" # In real life, hide this in env variables!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- SETUP ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE MODELS ---
class MaintenanceTeam(Base):
    __tablename__ = "maintenance_teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    members = relationship("User", back_populates="team")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True) # NEW
    password_hash = Column(String)                  # NEW
    role = Column(String, default="Technician")
    team_id = Column(Integer, ForeignKey("maintenance_teams.id"), nullable=True)
    team = relationship("MaintenanceTeam", back_populates="members")

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    serial_number = Column(String, unique=True)
    department = Column(String)
    location = Column(String)
    is_scrapped = Column(Boolean, default=False)
    default_team_id = Column(Integer, ForeignKey("maintenance_teams.id"))
    requests = relationship("MaintenanceRequest", back_populates="equipment")

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    request_type = Column(String)
    status = Column(String, default="New")
    scheduled_date = Column(DateTime, nullable=True)
    priority = Column(String, default="Normal")
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    equipment = relationship("Equipment", back_populates="requests")

Base.metadata.create_all(bind=engine)

# --- SCHEMAS ---
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- UTILS ---
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def validate_password_strength(password: str):
    # Logic: 8+ chars, 1 uppercase, 1 lowercase, 1 special char
    regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    if not re.match(regex, password):
        raise HTTPException(status_code=400, detail="Password must be 8+ chars, contain Upper, Lower, and Special char")

# --- AUTH ENDPOINTS ---

@app.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    # 1. Check Duplicates
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Account already exists")
    
    # 2. Validate Password Strength
    validate_password_strength(user.password)

    # 3. Create User
    hashed_pwd = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, password_hash=hashed_pwd, role="User")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Check User Existence
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Account does not exist")
    
    # 2. Check Password
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # 3. Generate Token
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": db_user.name}

# --- EXISTING ENDPOINTS (Keep these for the dashboard) ---
@app.get("/requests/")
def get_requests(db: Session = Depends(get_db)):
    return db.query(MaintenanceRequest).all()

# (Add your other previous endpoints: /teams, /equipment here if needed)