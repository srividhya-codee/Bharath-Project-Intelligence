import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, Text,
    ForeignKey, JSON, Enum, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class Ministry(Base):
    __tablename__ = "ministries"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    short_name = Column(String(100), nullable=True)

    departments = relationship("Department", back_populates="ministry")
    projects = relationship("Project", back_populates="ministry")
    users = relationship("User", back_populates="ministry")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    ministry_id = Column(Integer, ForeignKey("ministries.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    ministry = relationship("Ministry", back_populates="departments")
    projects = relationship("Project", back_populates="department")


class ImplementingAgency(Base):
    __tablename__ = "implementing_agencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # NHAI | DFCCIL | NICDC | CPSE | PSU | State Dept | District Admin | Other

    projects = relationship("Project", back_populates="implementing_agency")


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    region = Column(String(50), nullable=False)  # North, South, East, West, Central, North-East

    districts = relationship("District", back_populates="state")
    projects = relationship("Project", back_populates="state")
    users = relationship("User", back_populates="state")


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)

    state = relationship("State", back_populates="districts")
    projects = relationship("Project", back_populates="district")


class Sector(Base):
    __tablename__ = "sectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    projects = relationship("Project", back_populates="sector")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g. P-102
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    ministry_id = Column(Integer, ForeignKey("ministries.id"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)
    implementing_agency_id = Column(Integer, ForeignKey("implementing_agencies.id"), nullable=False, index=True)

    contractor_name = Column(String(255), nullable=True)
    project_manager_id = Column(Integer, nullable=True)

    approved_cost_cr = Column(Float, nullable=False)  # in ₹ Crore
    revised_cost_cr = Column(Float, nullable=True)
    expenditure_cr = Column(Float, nullable=False, default=0.0)

    start_date = Column(Date, nullable=False)
    planned_completion_date = Column(Date, nullable=False)
    expected_completion_date = Column(Date, nullable=False)
    actual_completion_date = Column(Date, nullable=True)

    status = Column(String(50), nullable=False, default="Active", index=True)  # Planned | Active | Completed | On Hold | Delayed
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_synthetic = Column(Boolean, default=True, nullable=False)

    # Relationships
    ministry = relationship("Ministry", back_populates="projects")
    department = relationship("Department", back_populates="projects")
    sector = relationship("Sector", back_populates="projects")
    state = relationship("State", back_populates="projects")
    district = relationship("District", back_populates="projects")
    implementing_agency = relationship("ImplementingAgency", back_populates="projects")

    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    progress_updates = relationship("ProgressUpdate", back_populates="project", cascade="all, delete-orphan")
    financial_records = relationship("FinancialRecord", back_populates="project", cascade="all, delete-orphan")
    risks = relationship("Risk", back_populates="project", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    planned_date = Column(Date, nullable=False)
    expected_date = Column(Date, nullable=False)
    actual_date = Column(Date, nullable=True)
    weight_pct = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="Pending")  # Pending | In Progress | Completed | Delayed

    project = relationship("Project", back_populates="milestones")


class ProgressUpdate(Base):
    __tablename__ = "progress_updates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    period_end = Column(Date, nullable=False, index=True)
    planned_physical_pct = Column(Float, nullable=False)
    actual_physical_pct = Column(Float, nullable=False)
    financial_progress_pct = Column(Float, nullable=False)
    remarks = Column(Text, nullable=True)
    submitted_by = Column(String(100), nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="progress_updates")


class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    fiscal_year = Column(String(20), nullable=False, index=True)  # e.g. 2024-25
    quarter = Column(String(10), nullable=False)  # Q1, Q2, Q3, Q4
    allocated_cr = Column(Float, nullable=False, default=0.0)
    released_cr = Column(Float, nullable=False, default=0.0)
    expended_cr = Column(Float, nullable=False, default=0.0)

    project = relationship("Project", back_populates="financial_records")


class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # Land Acquisition | Procurement | Contractor | Weather | Statutory Clearance | Funding | Utility Shifting | Technical | Legal
    severity = Column(String(50), nullable=False)  # Low | Medium | High | Critical
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="Open")  # Open | Mitigating | Closed

    project = relationship("Project", back_populates="risks")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    raised_by = Column(String(100), nullable=True)
    raised_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    status = Column(String(50), nullable=False, default="Open")  # Open | In Progress | Resolved
    resolution = Column(Text, nullable=True)

    project = relationship("Project", back_populates="issues")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    doc_type = Column(String(100), nullable=False, index=True)  # DPR | Proposal | Progress Report | Inspection Report | Tender | Contractor Report | Meeting Minutes | Financial Report | Circular | Review Report | Environmental Report
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    sensitivity_level = Column(String(50), default="Public")  # Public | Internal | Confidential | Restricted
    uploaded_by = Column(String(100), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    ingestion_status = Column(String(50), default="Indexed")  # Pending | Indexed | Failed
    checksum = Column(String(64), nullable=True)

    project = relationship("Project", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_no = Column(Integer, nullable=True)
    text = Column(Text, nullable=False)
    embedding_id = Column(String(100), nullable=True)

    document = relationship("Document", back_populates="chunks")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version = Column(String(50), nullable=False, default="v1.0.0-xgb")
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_band = Column(String(50), nullable=False)  # Low | Medium | High | Critical
    predicted_delay_days = Column(Integer, nullable=False, default=0)
    predicted_cost_overrun_pct = Column(Float, nullable=False, default=0.0)
    top_factors = Column(JSON, nullable=True)  # e.g. [{"feature": "SPI", "impact": "Positive", "contribution": 0.28}]
    generated_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    disclaimer = Column(String(255), default="AI Prediction, not a confirmed fact", nullable=False)

    project = relationship("Project", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(100), nullable=False, index=True)  # High Risk | Schedule Slippage | Cost Gap | Stalled
    severity = Column(String(50), nullable=False, index=True)  # Low | Medium | High | Critical
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)  # e.g. {"spi": 0.78, "financial_gap": 22.0, "sources": ["..."]}
    status = Column(String(50), nullable=False, default="Open", index=True)  # Open | Acknowledged | Resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="alerts")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # Super Admin | Government Officer | Project Authority | Senior Decision Maker
    ministry_id = Column(Integer, ForeignKey("ministries.id"), nullable=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    ministry = relationship("Ministry", back_populates="users")
    state = relationship("State", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String(100), nullable=True)
    before = Column(JSON, nullable=True)
    after = Column(JSON, nullable=True)
    ip = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="audit_logs")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(50), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    tools_used = Column(JSON, nullable=True)
    sources = Column(JSON, nullable=True)
    confidence = Column(String(20), nullable=True)  # High | Medium | Low
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
