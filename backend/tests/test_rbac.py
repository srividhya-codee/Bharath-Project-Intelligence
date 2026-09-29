import pytest
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.session import Base
from backend.app.db.models import User, Ministry, State, Sector, Project, ProgressUpdate, ImplementingAgency
from backend.app.services.project_service import apply_rbac_scope
from backend.app.api.v1.auth import verify_password, get_password_hash


@pytest.fixture(scope="module")
def test_db():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Seed ministries
    morth = Ministry(code="MoRTH", name="Ministry of Road Transport and Highways", short_name="MoRTH")
    railways = Ministry(code="MoR", name="Ministry of Railways", short_name="Railways")
    db.add_all([morth, railways])
    db.flush()

    # Seed states
    tn = State(code="TN", name="Tamil Nadu", region="South")
    mh = State(code="MH", name="Maharashtra", region="West")
    db.add_all([tn, mh])
    db.flush()

    # Seed sectors
    sec_highways = Sector(name="Roads & Highways")
    sec_railways = Sector(name="Railways")
    db.add_all([sec_highways, sec_railways])
    db.flush()

    # Seed agency
    nhai = ImplementingAgency(name="NHAI", type="NHAI")
    dfccil = ImplementingAgency(name="DFCCIL", type="DFCCIL")
    db.add_all([nhai, dfccil])
    db.flush()

    # Seed users with 4 roles
    admin = User(name="Super Admin", email="superadmin@demo.gov", hashed_password=get_password_hash("pass"), role="Super Admin", is_active=True)
    officer = User(name="MoRTH Officer", email="officer@demo.gov", hashed_password=get_password_hash("pass"), role="Government Officer", ministry_id=morth.id, is_active=True)
    authority = User(name="Project Authority", email="authority@demo.gov", hashed_password=get_password_hash("pass"), role="Project Authority", ministry_id=morth.id, state_id=tn.id, is_active=True)
    decisionmaker = User(name="Decision Maker", email="decisionmaker@demo.gov", hashed_password=get_password_hash("pass"), role="Senior Decision Maker", is_active=True)
    db.add_all([admin, officer, authority, decisionmaker])
    db.flush()

    # Seed 2 projects: 1 in MoRTH (Tamil Nadu), 1 in Railways (Maharashtra)
    p1 = Project(
        project_code="P-102", name="NHAI Highway Project", ministry_id=morth.id, sector_id=sec_highways.id,
        state_id=tn.id, implementing_agency_id=nhai.id, approved_cost_cr=1000.0, expenditure_cr=500.0,
        start_date=datetime.date(2022, 1, 1), planned_completion_date=datetime.date(2025, 1, 1),
        expected_completion_date=datetime.date(2025, 1, 1), status="Active", is_synthetic=True,
        project_manager_id=authority.id
    )
    p2 = Project(
        project_code="P-101", name="DFCCIL Railway Project", ministry_id=railways.id, sector_id=sec_railways.id,
        state_id=mh.id, implementing_agency_id=dfccil.id, approved_cost_cr=2000.0, expenditure_cr=1000.0,
        start_date=datetime.date(2022, 1, 1), planned_completion_date=datetime.date(2025, 1, 1),
        expected_completion_date=datetime.date(2025, 1, 1), status="Active", is_synthetic=True
    )
    db.add_all([p1, p2])
    db.commit()

    yield {
        "db": db, "admin": admin, "officer": officer, "authority": authority, "decisionmaker": decisionmaker,
        "p1": p1, "p2": p2
    }
    db.close()


def test_super_admin_has_national_scope(test_db):
    db = test_db["db"]
    admin = test_db["admin"]
    scoped = apply_rbac_scope(db.query(Project), admin).all()
    # Sees both projects
    assert len(scoped) == 2


def test_senior_decision_maker_has_national_scope(test_db):
    db = test_db["db"]
    dm = test_db["decisionmaker"]
    scoped = apply_rbac_scope(db.query(Project), dm).all()
    # National level visibility
    assert len(scoped) == 2


def test_government_officer_is_scoped_to_ministry(test_db):
    db = test_db["db"]
    officer = test_db["officer"]
    scoped = apply_rbac_scope(db.query(Project), officer).all()
    # Only sees P-102 (MoRTH), cannot see P-101 (Railways)
    assert len(scoped) == 1
    assert scoped[0].project_code == "P-102"


def test_project_authority_is_scoped_to_assigned_project(test_db):
    db = test_db["db"]
    authority = test_db["authority"]
    scoped = apply_rbac_scope(db.query(Project), authority).all()
    # Scoped only to P-102 where project_manager_id = authority.id
    assert len(scoped) == 1
    assert scoped[0].project_code == "P-102"


def test_password_hashing():
    pwd = "DemoGovPass@2026"
    h = get_password_hash(pwd)
    assert verify_password(pwd, h) is True
    assert verify_password("WrongPass", h) is False
