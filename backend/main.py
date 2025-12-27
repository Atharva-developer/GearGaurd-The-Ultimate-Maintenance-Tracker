from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt 
from typing import Optional

#setting up the db
SQLALCHEMY_DATABASE_URL = "postgresql://luckyghai@localhost/gearguard_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

#db models
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
    location = Column(String)       
    technician = Column(String)     
    category = Column(String)       
    employee = Column(String)       

class MaintenanceRequest(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    priority = Column(String)
    request_type = Column(String)
    status = Column(String)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    work_center_id = Column(Integer, ForeignKey("work_centers.id"), nullable=True)
    target_type = Column(String, default='equipment')  # 'equipment' or 'work_center'
    technician = Column(String)
    created_by = Column(String)  # Name or identifier of who created the request
    maintenance_team_id = Column(Integer)  # optional team assigned
    scheduled_date = Column(String)  # optional scheduled date in ISO format (YYYY-MM-DD or datetime)
    created_at = Column(String)
    closed_at = Column(String)

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    members = Column(String)  # comma-separated member names
    company = Column(String, default='My Company (San Francisco)')

class WorkCenter(Base):
    __tablename__ = "work_centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True, nullable=True)
    tag = Column(String, nullable=True)
    location = Column(String, nullable=True)
    capacity = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

#migration
from sqlalchemy import text
with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS technician VARCHAR;"))
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS created_by VARCHAR;"))
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS maintenance_team_id INTEGER;"))
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS scheduled_date VARCHAR;"))
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS created_at VARCHAR;"))
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS closed_at VARCHAR;"))
        # New for work centers & target type
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS work_center_id INTEGER;"))
        conn.execute(text("ALTER TABLE requests ADD COLUMN IF NOT EXISTS target_type VARCHAR;"))
        # Create table for work_centers if not exists (simple dev-time approach)
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS work_centers (id SERIAL PRIMARY KEY, name VARCHAR UNIQUE, code VARCHAR, tag VARCHAR, location VARCHAR, capacity VARCHAR);"
        ))
    except Exception as e:
        print("Warning: migration step failed:", e)

#Schemas
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
    target_type: Optional[str] = 'equipment'  # 'equipment' or 'work_center'
    equipment_id: Optional[int] = None
    work_center_id: Optional[int] = None
    technician: Optional[str] = None
    maintenance_team_id: Optional[int] = None
    scheduled_date: Optional[str] = None
    created_by: Optional[str] = None

class TeamCreate(BaseModel):
    name: str
    members: Optional[str] = ""  # comma-separated names
    company: Optional[str] = "My Company (San Francisco)"

class WorkCenterCreate(BaseModel):
    name: str
    code: Optional[str] = None
    tag: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[str] = None

class RequestUpdate(BaseModel):
    status: str

#setting up the app
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

#Endpoints

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

@app.get("/equipment/")
def get_equipment(db: Session = Depends(get_db)):
    return db.query(Equipment).all()

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

# Create Equipment endpoint with uniqueness check
@app.post("/equipment/")
def create_equipment(eq: EquipmentCreate, db: Session = Depends(get_db)):
    # Ensure serial number is unique
    existing = db.query(Equipment).filter(Equipment.serial_number == eq.serial_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Serial number already exists")

    new_eq = Equipment(
        name=eq.name,
        serial_number=eq.serial_number,
        location=eq.location,
        technician=eq.technician,
        category=eq.category,
        employee=eq.employee
    )
    db.add(new_eq)
    db.commit()
    db.refresh(new_eq)
    return new_eq

# Teams endpoints
@app.get('/teams/')
def get_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

@app.post('/teams/')
def create_team(t: TeamCreate, db: Session = Depends(get_db)):
    # basic uniqueness check
    if db.query(Team).filter(Team.name == t.name).first():
        raise HTTPException(status_code=400, detail='Team name already exists')
    new = Team(name=t.name, members=t.members or '', company=t.company)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

# Work Centers endpoints
@app.get('/work_centers/')
def get_work_centers(db: Session = Depends(get_db)):
    return db.query(WorkCenter).all()

@app.post('/work_centers/')
def create_work_center(w: WorkCenterCreate, db: Session = Depends(get_db)):
    if db.query(WorkCenter).filter(WorkCenter.name == w.name).first():
        raise HTTPException(status_code=400, detail='Work Center name already exists')
    new = WorkCenter(name=w.name, code=w.code or None, tag=w.tag or None, location=w.location or None, capacity=w.capacity or None)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new
@app.get("/requests/")
def get_requests(db: Session = Depends(get_db)):
    return db.query(MaintenanceRequest).all()

@app.post("/requests/")
def create_request(req: RequestCreate, db: Session = Depends(get_db)):
    try:
        import datetime
        #Validating
        if req.target_type == 'work_center':
            if not req.work_center_id:
                raise HTTPException(status_code=400, detail="work_center_id is required when target_type is 'work_center'")
            equipment_id = None
            work_center_id = int(req.work_center_id)
        else:
            if not req.equipment_id:
                raise HTTPException(status_code=400, detail="equipment_id is required when target_type is 'equipment'")
            equipment_id = int(req.equipment_id)
            work_center_id = None

        new_req = MaintenanceRequest(
            subject=req.subject,
            priority=req.priority,
            request_type=req.request_type,
            equipment_id=equipment_id,
            work_center_id=work_center_id,
            target_type=req.target_type or 'equipment',
            status="New",
            technician=req.technician,
            maintenance_team_id=int(req.maintenance_team_id) if req.maintenance_team_id else None,
            scheduled_date=req.scheduled_date or None,
            created_by=req.created_by,
            created_at=datetime.datetime.utcnow().isoformat()
        )
        db.add(new_req)
        db.commit()
        db.refresh(new_req)
        return new_req
    except HTTPException:
        # Re-raise validation HTTP errors
        raise
    except Exception as e:
        db.rollback()
        # Surface a helpful error message to the client
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/requests/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req

@app.put("/requests/{request_id}")
def update_request_status(request_id: int, update: RequestUpdate, db: Session = Depends(get_db)):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req: raise HTTPException(status_code=404, detail="Not found")
    import datetime
    req.status = update.status
    if update.status == 'Repaired':
        req.closed_at = datetime.datetime.utcnow().isoformat()
    db.commit()
    return {"message": "Updated"}

@app.get("/stats/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    active_statuses = ["New", "In Progress"]
    critical = db.query(MaintenanceRequest).filter(MaintenanceRequest.status.in_(active_statuses), MaintenanceRequest.priority == "Critical").count()
    active = db.query(MaintenanceRequest).filter(MaintenanceRequest.status.in_(active_statuses)).count()
    return {"critical_count": critical, "tech_load": f"{min(100, int((active/10)*100))}%", "open_count": active}

@app.get('/reports/summary')
def reports_summary(db: Session = Depends(get_db)):
    # Counts by status
    statuses = db.query(MaintenanceRequest.status, func.count(MaintenanceRequest.id)).group_by(MaintenanceRequest.status).all()
    status_counts = {s: c for s, c in statuses}

    # Counts by priority
    priorities = db.query(MaintenanceRequest.priority, func.count(MaintenanceRequest.id)).group_by(MaintenanceRequest.priority).all()
    priority_counts = {p: c for p, c in priorities}

    # Open by team
    teams = db.query(Team).all()
    team_counts = {}
    for t in teams:
        c = db.query(MaintenanceRequest).filter(MaintenanceRequest.maintenance_team_id == t.id).count()
        team_counts[t.name] = c

    # Average time to repair
    from datetime import datetime
    durations = []
    closed = db.query(MaintenanceRequest).filter(MaintenanceRequest.closed_at.isnot(None)).all()
    for r in closed:
        try:
            created = datetime.fromisoformat(r.created_at)
            closed_at = datetime.fromisoformat(r.closed_at)
            durations.append((closed_at - created).total_seconds())
        except Exception:
            continue
    avg_seconds = int(sum(durations)/len(durations)) if durations else None

    return {
        'status_counts': status_counts,
        'priority_counts': priority_counts,
        'team_counts': team_counts,
        'avg_time_to_repair_seconds': avg_seconds
    }
