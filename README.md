# GearGuard — The Ultimate Maintenance Tracker 🛠️

A lightweight maintenance management app built with FastAPI (backend) and React + Vite (frontend). GearGuard tracks equipment, maintenance requests (Kanban), teams, work centers, reports and a maintenance calendar to help operations and maintenance teams coordinate and report on work.

---

## 🔎 Key Features

- Equipment management (add / list / delete)
- Maintenance Requests (create, move between statuses via Kanban, assign technician/team)
- Teams & Work Centers (create and assign)
- Reporting (status counts, priority counts, average time to repair)
- Maintenance Calendar (view scheduled and raised requests by date)
- Basic account & settings scaffolding (localStorage-based demo auth)

---

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Pydantic
- Database: PostgreSQL (local dev) — ad-hoc migrations implemented as idempotent SQL for dev convenience
- Frontend: React (Vite), Tailwind-style utility classes, lucide-react icons
- Tooling: uvicorn (dev server), npm (frontend), psql (DB)

---

## 🧭 Repository Layout

```
backend/
  main.py
  requirements.txt
  seed.py
frontend/
  index.html
  package.json
  src/
    App.jsx
    KanbanBoard.jsx
    EquipmentPage.jsx
    NewRequestPage.jsx
    MaintenanceCalendar.jsx
    ReportsPage.jsx
    TeamsPage.jsx
    WorkCentersPage.jsx
    SettingsPage.jsx
```

---

## 🚀 Quickstart (Local Development)

> These commands assume macOS/Linux. Adjust for Windows where necessary.

### 1) Create & configure DB

Install PostgreSQL and create a database & user (example):

```bash
# create db and user (example)
createdb gearguard_db
# or using psql:
# psql -U <your_db_user> -c "CREATE DATABASE gearguard_db;"
```

> The backend uses the connection string in `backend/main.py` by default: `postgresql://luckyghai@localhost/gearguard_db`. If you need to change it, edit `main.py` or set up environment variables and modify accordingly.

### 2) Backend — install & run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# start server
python -m uvicorn main:app --reload
```

- On startup the backend will run idempotent ALTER TABLE / CREATE TABLE statements (dev convenience) to add new columns / tables that were introduced during development.
- Seed demo equipment (optional):

```bash
# inside backend/ run (if available)
python seed.py
# or call the endpoint: POST /equipment/seed using curl or browser
```

### 3) Frontend — install & run

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

---

## API Overview (Selected Endpoints)

- `GET /equipment/` — list equipment
- `POST /equipment/` — create equipment (enforces unique serial number)
- `GET /requests/` — list maintenance requests
- `POST /requests/` — create a request (supports target_type: equipment | work_center)
- `GET /requests/{id}` — request detail
- `PUT /requests/{id}` — update status
- `GET /teams/`, `POST /teams/` — manage teams
- `GET /work_centers/`, `POST /work_centers/` — manage work centers
- `GET /reports/summary` — aggregated metrics

---

## UI Notes & Behavior

- Kanban board supports drag-and-drop to change status; updating a card triggers a backend `PUT /requests/{id}`.
- New Request page allows selecting `Target` type: Equipment or Work Center.
- Calendar page shows both *scheduled* counts and which dates requests were *raised* on. Clicking a date lists request details (Raised & Scheduled timestamps).

---

## Development Tips & TODOs

- This repo uses simple in-code migration SQL for fast iterations. For production, migrate to Alembic for safe, tracked migrations.
- Recommended improvements:
  - Add unit/integration tests
  - Add user auth & permissions
  - Replace in-code migrations with Alembic migration scripts
  - Enhance reports with charts (Chart.js / Recharts)
  - Add CI (GitHub Actions) for linting/tests

---

## Contributing

- Fork and create a feature branch (e.g., `feature/your-feature`)
- Commit changes with clear messages
- Open a pull request against the repository `main` branch for review

If you pushed from a local branch (e.g., `lucky-final-version`) and want it merged, open a PR on GitHub and request review from collaborators.

---

## License

MIT License — see `LICENSE` (if present). Otherwise, feel free to add the license you prefer.

---

## Contact

If you need help with setup, migrations, or CI, open an issue on the repository or reach out to the maintainer.

Happy building! 🎉
