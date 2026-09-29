"""Comprehensive Database Seeding Script for Bharat Project Intelligence.

Generates 75+ realistic synthetic government infrastructure and development projects
across 15+ Indian states and all mandated sectors and ministries.
Sets up demo user accounts, verified metrics, progress milestones, risks, issues,
early-warning alerts, predictions, and document references.

Badge: Synthetic Demonstration Data
"""
import os
import sys
import datetime
import random
import hashlib

# Ensure backend path is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.session import SessionLocal, Base, engine
from backend.app.db.models import (
    Ministry, Department, ImplementingAgency, State, District,
    Sector, Project, Milestone, ProgressUpdate, FinancialRecord,
    Risk, Issue, Document, DocumentChunk, Prediction, Alert,
    User, AuditLog
)
from backend.app.services.metrics import compute_all_project_metrics


def get_password_hash(password: str) -> str:
    """Deterministic hash for seeding purposes (compatible with backend auth)."""
    # Uses SHA256 hex for lightweight demo seed, backend verify will support this or bcrypt
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def seed_database():
    print("Initiating Bharat Project Intelligence database seeding...")
    # Create tables if not existing
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Project).filter(Project.project_code == "P-102").first():
            print("Database already contains seed data. Skipping re-seed.")
            return

        # -------------------------------------------------------------
        # 1. MINISTRIES & DEPARTMENTS
        # -------------------------------------------------------------
        ministries_data = [
            ("MoRTH", "Ministry of Road Transport and Highways", "MoRTH", ["Highways", "Road Safety"]),
            ("MoR", "Ministry of Railways", "Railways", ["Railway Board", "Infrastructure Planning"]),
            ("MoHUA", "Ministry of Housing and Urban Affairs", "MoHUA", ["Smart Cities", "Urban Transport", "CPWD"]),
            ("MoP", "Ministry of Power", "Power", ["Transmission", "Thermal & Hydro", "Distribution"]),
            ("MNRE", "Ministry of New and Renewable Energy", "MNRE", ["Solar Energy", "Wind Energy", "Green Hydrogen"]),
            ("MoJS", "Ministry of Jal Shakti", "Jal Shakti", ["Drinking Water and Sanitation", "Water Resources"]),
            ("MeitY", "Ministry of Electronics and Information Technology", "MeitY", ["Digital Infrastructure", "E-Governance"]),
            ("MoHFW", "Ministry of Health and Family Welfare", "MoHFW", ["Pradhan Mantri Swasthya Suraksha", "Medical Infrastructure"]),
            ("MoE", "Ministry of Education", "Education", ["Higher Education", "School Education"]),
            ("MoRD", "Ministry of Rural Development", "Rural Development", ["PMGSY Roads", "Rural Housing"]),
            ("MoPSW", "Ministry of Ports, Shipping and Waterways", "Ports & Shipping", ["Sagarmala", "Inland Waterways"]),
            ("MoCA", "Ministry of Civil Aviation", "Civil Aviation", ["UDAN Scheme", "Airport Authority"]),
            ("MoCI", "Ministry of Commerce and Industry", "Commerce & Industry", ["DPIIT - Industrial Corridors"])
        ]

        ministry_map = {}
        dept_map = {}
        for code, name, short_name, depts in ministries_data:
            m = Ministry(code=code, name=name, short_name=short_name)
            db.add(m)
            db.flush()
            ministry_map[code] = m.id
            for d_name in depts:
                d = Department(ministry_id=m.id, name=d_name)
                db.add(d)
                db.flush()
                dept_map[f"{code}:{d_name}"] = d.id

        # -------------------------------------------------------------
        # 2. IMPLEMENTING AGENCIES
        # -------------------------------------------------------------
        agencies_data = [
            ("National Highways Authority of India (NHAI)", "NHAI"),
            ("Dedicated Freight Corridor Corporation of India (DFCCIL)", "DFCCIL"),
            ("National Industrial Corridor Development Corp (NICDC)", "NICDC"),
            ("National High Speed Rail Corporation (NHSRCL)", "CPSE"),
            ("Solar Energy Corporation of India (SECI)", "CPSE"),
            ("National Thermal Power Corporation (NTPC)", "PSU"),
            ("State Water and Sanitation Mission (SWSM)", "State Dept"),
            ("Bangalore Metro Rail Corporation (BMRCL)", "CPSE"),
            ("Central Public Works Department (CPWD)", "Other"),
            ("State Public Works Department (State PWD)", "State Dept"),
            ("District Rural Development Agency (DRDA)", "District Admin"),
            ("Airports Authority of India (AAI)", "PSU"),
            ("Bharat Broadband Network Limited (BBNL)", "CPSE")
        ]

        agency_map = {}
        for name, atype in agencies_data:
            agency = ImplementingAgency(name=name, type=atype)
            db.add(agency)
            db.flush()
            agency_map[name] = agency.id

        # -------------------------------------------------------------
        # 3. STATES & DISTRICTS
        # -------------------------------------------------------------
        states_data = [
            ("TN", "Tamil Nadu", "South", ["Madurai", "Tirunelveli", "Chennai", "Coimbatore", "Salem"]),
            ("MH", "Maharashtra", "West", ["Mumbai Suburban", "Pune", "Nagpur", "Nashik", "Thane"]),
            ("GJ", "Gujarat", "West", ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Kutch"]),
            ("UP", "Uttar Pradesh", "North", ["Varanasi", "Lucknow", "Gorakhpur", "Prayagraj", "Kanpur"]),
            ("KA", "Karnataka", "South", ["Bengaluru Urban", "Mysuru", "Hubballi", "Belagavi", "Mangaluru"]),
            ("RJ", "Rajasthan", "North", ["Jodhpur", "Jaipur", "Bikaner", "Udaipur", "Kota"]),
            ("OD", "Odisha", "East", ["Bhubaneswar", "Puri", "Cuttack", "Sambalpur", "Sundargarh"]),
            ("BR", "Bihar", "East", ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"]),
            ("AS", "Assam", "North-East", ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"]),
            ("MP", "Madhya Pradesh", "Central", ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"]),
            ("WB", "West Bengal", "East", ["Kolkata", "Howrah", "Siliguri", "Asansol", "Durgapur"]),
            ("TS", "Telangana", "South", ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"]),
            ("KL", "Kerala", "South", ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur"]),
            ("PB", "Punjab", "North", ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"]),
            ("JH", "Jharkhand", "East", ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"]),
            ("AP", "Andhra Pradesh", "South", ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kurnool"])
        ]

        state_map = {}
        district_map = {}
        for scode, sname, sregion, d_list in states_data:
            st = State(code=scode, name=sname, region=sregion)
            db.add(st)
            db.flush()
            state_map[sname] = st.id
            for d_name in d_list:
                dist = District(state_id=st.id, name=d_name)
                db.add(dist)
                db.flush()
                district_map[f"{sname}:{d_name}"] = dist.id

        # -------------------------------------------------------------
        # 4. SECTORS
        # -------------------------------------------------------------
        sectors = [
            "Roads & Highways", "Railways", "Metro/Rapid Transit", "Airports", "Ports",
            "Power", "Renewable Energy", "Water Supply", "Irrigation", "Urban Infrastructure",
            "Rural Infrastructure", "Healthcare", "Education", "Digital Infrastructure",
            "Industrial Corridors", "Housing", "Telecommunications"
        ]
        sector_map = {}
        for sname in sectors:
            sec = Sector(name=sname)
            db.add(sec)
            db.flush()
            sector_map[sname] = sec.id

        # -------------------------------------------------------------
        # 5. DEMO USERS (4 Mandated Roles)
        # -------------------------------------------------------------
        demo_password_hash = get_password_hash("DemoGovPass@2026")
        demo_users = [
            ("National Super Administrator", "superadmin@demo.gov", "Super Admin", None, None),
            ("Ministry Monitoring Officer", "officer@demo.gov", "Government Officer", ministry_map["MoRTH"], None),
            ("NHAI Project Authority (Tamil Nadu)", "authority@demo.gov", "Project Authority", ministry_map["MoRTH"], state_map["Tamil Nadu"]),
            ("Senior Government Decision Maker", "decisionmaker@demo.gov", "Senior Decision Maker", None, None),
        ]
        user_map = {}
        for uname, uemail, urole, umin, ustate in demo_users:
            u = User(
                name=uname,
                email=uemail,
                hashed_password=demo_password_hash,
                role=urole,
                ministry_id=umin,
                state_id=ustate,
                is_active=True
            )
            db.add(u)
            db.flush()
            user_map[uemail] = u.id

        # -------------------------------------------------------------
        # 6. FEATURED DEMO PROJECTS (Mandatory in brief)
        # -------------------------------------------------------------
        
        # P-102: Highway, Tamil Nadu (MoRTH/NHAI) - Crucial Worked Example
        p102 = Project(
            project_code="P-102",
            name="Four-Laning of National Highway Corridor Package - Demo",
            description="Four-laning dual carriageway development spanning 78.4 km on critical freight corridor in Madurai-Tirunelveli section.",
            ministry_id=ministry_map["MoRTH"],
            department_id=dept_map.get("MoRTH:Highways"),
            sector_id=sector_map["Roads & Highways"],
            state_id=state_map["Tamil Nadu"],
            district_id=district_map.get("Tamil Nadu:Madurai"),
            implementing_agency_id=agency_map["National Highways Authority of India (NHAI)"],
            contractor_name="L&T - Ashoka Buildcon JV (Synthetic)",
            project_manager_id=user_map["authority@demo.gov"],
            approved_cost_cr=1250.0,
            revised_cost_cr=1380.0,
            expenditure_cr=1050.0,
            start_date=datetime.date(2022, 4, 1),
            planned_completion_date=datetime.date(2025, 3, 31),
            expected_completion_date=datetime.date(2025, 7, 1), # 92 days delay (~3 months)
            status="Delayed",
            latitude=9.9252,
            longitude=78.1198,
            is_synthetic=True
        )
        db.add(p102)
        db.flush()

        # P-102 Milestones
        db.add_all([
            Milestone(project_id=p102.id, name="Land Acquisition 80% Notification", planned_date=datetime.date(2022, 8, 30), expected_date=datetime.date(2022, 11, 15), actual_date=datetime.date(2022, 12, 10), weight_pct=15.0, status="Completed"),
            Milestone(project_id=p102.id, name="Earthwork & Subgrade Formation (40 km)", planned_date=datetime.date(2023, 5, 31), expected_date=datetime.date(2023, 7, 20), actual_date=datetime.date(2023, 8, 14), weight_pct=20.0, status="Completed"),
            Milestone(project_id=p102.id, name="GSB & Dense Bituminous Paving (Ch 42 to 78)", planned_date=datetime.date(2024, 6, 30), expected_date=datetime.date(2024, 11, 30), actual_date=None, weight_pct=30.0, status="Delayed"),
            Milestone(project_id=p102.id, name="Major River Bridges & Grade Separators", planned_date=datetime.date(2024, 12, 31), expected_date=datetime.date(2025, 4, 30), actual_date=None, weight_pct=20.0, status="Delayed"),
            Milestone(project_id=p102.id, name="Final Road Markings & Commercial Toll Commissioning", planned_date=datetime.date(2025, 3, 31), expected_date=datetime.date(2025, 7, 1), actual_date=None, weight_pct=15.0, status="Pending")
        ])

        # P-102 Progress Updates (Reaching 80% planned vs 62% actual, 84% spend)
        db.add_all([
            ProgressUpdate(project_id=p102.id, period_end=datetime.date(2023, 9, 30), planned_physical_pct=45.0, actual_physical_pct=42.0, financial_progress_pct=48.0, remarks="Earthwork on non-forest section proceeding smoothly.", submitted_by="Project Director NHAI"),
            ProgressUpdate(project_id=p102.id, period_end=datetime.date(2024, 3, 31), planned_physical_pct=65.0, actual_physical_pct=54.0, financial_progress_pct=66.0, remarks="Utility shifting delay on 110kV lines impacting sub-base pacing.", submitted_by="Project Director NHAI"),
            ProgressUpdate(project_id=p102.id, period_end=datetime.date(2024, 8, 31), planned_physical_pct=80.0, actual_physical_pct=62.0, financial_progress_pct=84.0, remarks="Continuous unseasonal downpours and pending RoW between Ch 42-56 caused 18% physical gap.", submitted_by="Project Director NHAI")
        ])

        # P-102 Financial Records
        db.add_all([
            FinancialRecord(project_id=p102.id, fiscal_year="2022-23", quarter="Full Year", allocated_cr=300.0, released_cr=300.0, expended_cr=280.0),
            FinancialRecord(project_id=p102.id, fiscal_year="2023-24", quarter="Full Year", allocated_cr=550.0, released_cr=550.0, expended_cr=510.0),
            FinancialRecord(project_id=p102.id, fiscal_year="2024-25", quarter="Q1-Q2", allocated_cr=400.0, released_cr=350.0, expended_cr=260.0)
        ])

        # P-102 Risks & Issues
        db.add_all([
            Risk(project_id=p102.id, category="Land Acquisition", severity="Critical", description="Contiguous 14.5 km right-of-way between Ch 42+000 and Ch 56+500 unhanded due to court arbitration on compensation.", status="Open"),
            Risk(project_id=p102.id, category="Utility Shifting", severity="High", description="110kV electrical line relocation awaiting State transmission shutdown permits.", status="Open"),
            Risk(project_id=p102.id, category="Weather", severity="High", description="Severe Northeast monsoon rain causing soil saturation and halting asphalt paving.", status="Mitigating"),
            Risk(project_id=p102.id, category="Procurement", severity="Medium", description="Aggregates supply shortfall from regional stone quarries.", status="Open"),
            Issue(project_id=p102.id, title="Compensation disbursement stalled in 3 revenue villages", description="Land owners have filed an interim injunction petition in Sub-Court.", raised_by="CALA Liaison Officer", status="In Progress", resolution="Lok Adalat special conciliation camp scheduled.")
        ])

        # P-102 Prediction & Alert (Risk Score 82, ~3 months delay, top SHAP factors)
        db.add(Prediction(
            project_id=p102.id,
            model_version="v1.0.0-xgb",
            risk_score=82.0,
            risk_band="Critical",
            predicted_delay_days=92,
            predicted_cost_overrun_pct=10.4,
            top_factors=[
                {"feature": "physical_progress_gap", "impact": "High Risk Driver", "contribution": 0.34, "description": "Physical progress 18% behind plan (SPI 0.775)"},
                {"feature": "financial_physical_gap", "impact": "High Risk Driver", "contribution": 0.26, "description": "Spending is 22 points ahead of physical delivery"},
                {"feature": "land_acquisition_risk", "impact": "Critical Bottleneck", "contribution": 0.22, "description": "Open severe land acquisition hindrance at Ch 42-56"},
                {"feature": "monsoon_weather_impact", "impact": "Moderate Delay", "contribution": 0.12, "description": "Upcoming Northeast monsoon vulnerable season"}
            ],
            disclaimer="AI Prediction, not a confirmed fact"
        ))

        db.add(Alert(
            project_id=p102.id,
            alert_type="High Risk",
            severity="Critical",
            title="CRITICAL RISK: Major Schedule & Financial Divergence Detected on P-102",
            explanation="Physical progress is 18 points behind plan (SPI 0.775) while financial spending stands at 84%. Predicted delay is 92 days (~3 months). Primary drivers are unhanded land at Ch 42-56 km and monsoon disruption.",
            evidence={
                "spi": 0.775,
                "cpi": 0.738,
                "planned_physical_pct": 80.0,
                "actual_physical_pct": 62.0,
                "financial_progress_pct": 84.0,
                "predicted_delay_days": 92,
                "risk_score": 82.0,
                "sources": ["Inspection Report (p.4)", "Review Meeting Minutes (p.2)", "Contractor Monthly Report (p.1)"]
            },
            status="Open"
        ))

        # P-101: Healthy Railway Freight Corridor (DFCCIL)
        p101 = Project(
            project_code="P-101",
            name="Dedicated Freight Corridor Electrified Double-Line Package - Demo",
            description="Mechanized double-line track construction and 2x25 kV overhead electrification for heavy haul freight operations.",
            ministry_id=ministry_map["MoR"],
            department_id=dept_map.get("MoR:Railway Board"),
            sector_id=sector_map["Railways"],
            state_id=state_map["Maharashtra"],
            district_id=district_map.get("Maharashtra:Thane"),
            implementing_agency_id=agency_map["Dedicated Freight Corridor Corporation of India (DFCCIL)"],
            contractor_name="Tata Projects - Sojitz Consortium (Synthetic)",
            approved_cost_cr=5400.0,
            revised_cost_cr=None,
            expenditure_cr=3820.0,
            start_date=datetime.date(2021, 10, 1),
            planned_completion_date=2025 and datetime.date(2025, 9, 30),
            expected_completion_date=datetime.date(2025, 9, 15),
            status="Active",
            latitude=19.2183,
            longitude=72.9781,
            is_synthetic=True
        )
        db.add(p101)
        db.flush()

        db.add(ProgressUpdate(
            project_id=p101.id, period_end=datetime.date(2024, 8, 31),
            planned_physical_pct=72.0, actual_physical_pct=73.5, financial_progress_pct=70.7,
            remarks="NTC track laying pacing 1.4 km/day. Ahead of scheduled timeline.", submitted_by="DFCCIL Chief Project Manager"
        ))
        db.add(Prediction(
            project_id=p101.id, model_version="v1.0.0-xgb", risk_score=14.0, risk_band="Low",
            predicted_delay_days=0, predicted_cost_overrun_pct=0.0,
            top_factors=[{"feature": "spi_health", "impact": "Positive", "contribution": 0.45, "description": "SPI 1.021 ahead of schedule"}],
            disclaimer="AI Prediction, not a confirmed fact"
        ))

        # P-103: Industrial Corridor with Scope Revision Overrun (NICDC)
        p103 = Project(
            project_code="P-103",
            name="Integrated Multi-Modal Logistics Hub & Industrial Node - Demo",
            description="Smart industrial city node with multi-modal logistics hub, inland container depot, and smart utilities.",
            ministry_id=ministry_map["MoCI"],
            department_id=dept_map.get("MoCI:DPIIT - Industrial Corridors"),
            sector_id=sector_map["Industrial Corridors"],
            state_id=state_map["Rajasthan"],
            district_id=district_map.get("Rajasthan:Jaipur"),
            implementing_agency_id=agency_map["National Industrial Corridor Development Corp (NICDC)"],
            contractor_name="Shapoorji Pallonji EPC (Synthetic)",
            approved_cost_cr=2100.0,
            revised_cost_cr=2680.0, # +27.6% cost overrun
            expenditure_cr=1220.0,
            start_date=datetime.date(2022, 6, 1),
            planned_completion_date=datetime.date(2025, 12, 31),
            expected_completion_date=datetime.date(2026, 4, 30),
            status="Active",
            latitude=26.9124,
            longitude=75.7873,
            is_synthetic=True
        )
        db.add(p103)
        db.flush()

        db.add(ProgressUpdate(
            project_id=p103.id, period_end=datetime.date(2024, 8, 31),
            planned_physical_pct=55.0, actual_physical_pct=51.0, financial_progress_pct=58.1,
            remarks="Scope addition of 45 MLD ZLD plant and rail freight yard approved by state.", submitted_by="NICDC Project Director"
        ))
        db.add(Prediction(
            project_id=p103.id, model_version="v1.0.0-xgb", risk_score=58.0, risk_band="Medium",
            predicted_delay_days=120, predicted_cost_overrun_pct=27.6,
            top_factors=[
                {"feature": "scope_revision", "impact": "High Cost Driver", "contribution": 0.42, "description": "Approved RCE +27.6% due to ZLD common effluent plant"},
                {"feature": "steel_cement_escalation", "impact": "Inflation Factor", "contribution": 0.28, "description": "Material price index escalation"}
            ],
            disclaimer="AI Prediction, not a confirmed fact"
        ))

        # P-104: Renewable Solar Park Delayed by Transmission Connectivity
        p104 = Project(
            project_code="P-104",
            name="500 MW Ultra-Mega Grid-Connected Solar Park - Demo",
            description="500 MW solar park with central pooling substation and evacuation infrastructure in Thar desert region.",
            ministry_id=ministry_map["MNRE"],
            department_id=dept_map.get("MNRE:Solar Energy"),
            sector_id=sector_map["Renewable Energy"],
            state_id=state_map["Rajasthan"],
            district_id=district_map.get("Rajasthan:Jodhpur"),
            implementing_agency_id=agency_map["Solar Energy Corporation of India (SECI)"],
            contractor_name="Sterling & Wilson Solar (Synthetic)",
            approved_cost_cr=1850.0,
            revised_cost_cr=1920.0,
            expenditure_cr=1420.0,
            start_date=datetime.date(2023, 1, 15),
            planned_completion_date=datetime.date(2024, 12, 31),
            expected_completion_date=datetime.date(2025, 5, 31),
            status="Delayed",
            latitude=26.2389,
            longitude=73.0243,
            is_synthetic=True
        )
        db.add(p104)
        db.flush()

        db.add(ProgressUpdate(
            project_id=p104.id, period_end=datetime.date(2024, 8, 31),
            planned_physical_pct=85.0, actual_physical_pct=64.0, financial_progress_pct=76.8,
            remarks="Solar array 88% installed but 400kV ISTS grid pooling substation delayed by transmission utility.", submitted_by="SECI Regional Engineer"
        ))
        db.add(Prediction(
            project_id=p104.id, model_version="v1.0.0-xgb", risk_score=71.0, risk_band="High",
            predicted_delay_days=151, predicted_cost_overrun_pct=3.8,
            top_factors=[
                {"feature": "grid_evacuation_bottleneck", "impact": "Severe Delay", "contribution": 0.48, "description": "ISTS pooling substation delayed 7 months"},
                {"feature": "physical_progress_gap", "impact": "Schedule Lag", "contribution": 0.28, "description": "21% physical gap (SPI 0.753)"}
            ],
            disclaimer="AI Prediction, not a confirmed fact"
        ))

        # P-105: Rural Water Supply (High Spend vs Low Progress Gap)
        p105 = Project(
            project_code="P-105",
            name="Multi-Village Rural Water Supply Scheme - Demo",
            description="Comprehensive surface water intake, water treatment plant, and reticulation piped supply across 142 gram panchayats.",
            ministry_id=ministry_map["MoJS"],
            department_id=dept_map.get("MoJS:Drinking Water and Sanitation"),
            sector_id=sector_map["Water Supply"],
            state_id=state_map["Bihar"],
            district_id=district_map.get("Bihar:Patna"),
            implementing_agency_id=agency_map["State Water and Sanitation Mission (SWSM)"],
            contractor_name="NCC - Megha Engineering JV (Synthetic)",
            approved_cost_cr=640.0,
            revised_cost_cr=None,
            expenditure_cr=512.0,
            start_date=datetime.date(2022, 9, 1),
            planned_completion_date=datetime.date(2025, 2, 28),
            expected_completion_date=datetime.date(2025, 9, 30),
            status="Delayed",
            latitude=25.5941,
            longitude=85.1376,
            is_synthetic=True
        )
        db.add(p105)
        db.flush()

        db.add(ProgressUpdate(
            project_id=p105.id, period_end=datetime.date(2024, 8, 31),
            planned_physical_pct=75.0, actual_physical_pct=44.0, financial_progress_pct=80.0,
            remarks="Severe financial-physical gap (+36%). Pipe supply advances booked without village delivery.", submitted_by="Executive Engineer SWSM"
        ))
        db.add(Prediction(
            project_id=p105.id, model_version="v1.0.0-xgb", risk_score=86.0, risk_band="Critical",
            predicted_delay_days=214, predicted_cost_overrun_pct=14.2,
            top_factors=[
                {"feature": "financial_physical_divergence", "impact": "High Risk", "contribution": 0.46, "description": "Financial expenditure (+36%) vastly exceeds physical delivery (44%)"},
                {"feature": "village_reticulation_stall", "impact": "Bottleneck", "contribution": 0.31, "description": "Road cutting permissions delayed in 124 villages"}
            ],
            disclaimer="AI Prediction, not a confirmed fact"
        ))
        db.add(Alert(
            project_id=p105.id, alert_type="Cost Gap", severity="Critical",
            title="CRITICAL ANOMALY: Severe Financial vs Physical Disparity on P-105",
            explanation="Financial progress is 80.0% (Rs. 512 Cr) while physical completion is only 44.0%. A financial-physical divergence of 36 percentage points indicates advance payments without physical works.",
            evidence={"financial_progress_pct": 80.0, "actual_physical_pct": 44.0, "financial_gap": 36.0, "risk_score": 86.0},
            status="Open"
        ))

        # P-106: Completed Benchmark Metro Project
        p106 = Project(
            project_code="P-106",
            name="Rapid Transit Metro Rail Extension Reach Package - Demo",
            description="Elevated viaduct reach of 18.2 km with 16 elevated stations and automatic train operation signaling.",
            ministry_id=ministry_map["MoHUA"],
            department_id=dept_map.get("MoHUA:Urban Transport"),
            sector_id=sector_map["Metro/Rapid Transit"],
            state_id=state_map["Karnataka"],
            district_id=district_map.get("Karnataka:Bengaluru Urban"),
            implementing_agency_id=agency_map["Bangalore Metro Rail Corporation (BMRCL)"],
            contractor_name="Afcons Infrastructure - ITD JV (Synthetic)",
            approved_cost_cr=3200.0,
            revised_cost_cr=3248.0,
            expenditure_cr=3248.0,
            start_date=datetime.date(2020, 1, 10),
            planned_completion_date=datetime.date(2024, 1, 15),
            expected_completion_date=datetime.date(2024, 2, 28),
            actual_completion_date=datetime.date(2024, 2, 28),
            status="Completed",
            latitude=12.9716,
            longitude=77.5946,
            is_synthetic=True
        )
        db.add(p106)
        db.flush()

        db.add(ProgressUpdate(
            project_id=p106.id, period_end=datetime.date(2024, 2, 28),
            planned_physical_pct=100.0, actual_physical_pct=100.0, financial_progress_pct=100.0,
            remarks="Commercial service commissioned by Ministry. Benchmark completion with minimal 1.5% cost variation.", submitted_by="BMRCL Director Projects"
        ))
        db.add(Prediction(
            project_id=p106.id, model_version="v1.0.0-xgb", risk_score=8.0, risk_band="Low",
            predicted_delay_days=0, predicted_cost_overrun_pct=1.5,
            top_factors=[{"feature": "project_completed", "impact": "Positive", "contribution": 0.8, "description": "Completed benchmark status"}],
            disclaimer="AI Prediction, not a confirmed fact"
        ))

        # -------------------------------------------------------------
        # 7. GENERATE 70 ADDITIONAL REALISTIC SYNTHETIC PROJECTS
        # -------------------------------------------------------------
        print("Synthesizing 70 diversified projects across states and sectors...")

        states_keys = list(state_map.keys())
        sectors_keys = list(sector_map.keys())
        agency_names = list(agency_map.keys())
        min_keys = list(ministry_map.keys())

        # Sector cost profiles (min, max in Cr)
        sector_cost_ranges = {
            "Roads & Highways": (500, 3500),
            "Railways": (1200, 8000),
            "Metro/Rapid Transit": (2000, 9000),
            "Airports": (600, 4500),
            "Ports": (400, 3000),
            "Power": (800, 5000),
            "Renewable Energy": (300, 2500),
            "Water Supply": (150, 1200),
            "Irrigation": (400, 3500),
            "Urban Infrastructure": (200, 1800),
            "Rural Infrastructure": (100, 800),
            "Healthcare": (300, 1600),
            "Education": (150, 900),
            "Digital Infrastructure": (250, 2200),
            "Industrial Corridors": (1000, 6000),
            "Housing": (150, 1100),
            "Telecommunications": (200, 1500)
        }

        # Project title templates
        title_templates = {
            "Roads & Highways": ["Four-Laning of Economic Corridor Bypass - Demo", "Widening to 6-Lane Access-Controlled Expressway - Demo", "Strategic Inter-District Ring Road Package - Demo", "Hill Highway Tunnel & Realignment Package - Demo"],
            "Railways": ["Third & Fourth Railway Line Doubling Project - Demo", "Railway Yard Modernization & Electronic Interlocking - Demo", "Strategic High-Capacity Broad Gauge Link - Demo"],
            "Metro/Rapid Transit": ["Metro Corridor Phase-II Elevated Reach - Demo", "Underground Metro Tunneling & Station Box Package - Demo", "Light Metro Regional Feeder Network - Demo"],
            "Airports": ["Greenfield Domestic Passenger Terminal & Apron Expansion - Demo", "Runway Extension & CAT-III Instrument Landing System - Demo"],
            "Ports": ["Deep-Draft Container Transshipment Berth Construction - Demo", "Mechanized Coal & Fertilizer Cargo Terminal - Demo"],
            "Power": ["2x660 MW Supercritical Thermal Power Plant Unit - Demo", "765 kV Extra-High-Voltage Grid Interconnection - Demo"],
            "Renewable Energy": ["300 MW Wind-Solar Hybrid Generation Complex - Demo", "Floating Solar PV Array Reservoir Installation - Demo", "Green Hydrogen Production Pilot Facility - Demo"],
            "Water Supply": ["Integrated River Intake & Surface Piped Water Supply - Demo", "District Bulk Drinking Water Grid Pipeline - Demo"],
            "Irrigation": ["Lift Irrigation Barrage & Underground Pressure Pipe Network - Demo", "Canal Lining & Micro-Irrigation Command Area Network - Demo"],
            "Urban Infrastructure": ["Integrated Command & Control Smart City Center - Demo", "Storm Water Drainage & Flood Mitigation System - Demo", "Multi-Level Automated Car Parking & Transit Hub - Demo"],
            "Rural Infrastructure": ["All-Weather PMGSY Rural Connectivity Bridge Package - Demo", "Rural Agro-Logistics Warehousing Hub - Demo"],
            "Healthcare": ["500-Bed Super-Specialty Medical College Hospital - Demo", "Regional Trauma Care & Infectious Disease Center - Demo"],
            "Education": ["State Technological University Permanent Campus - Demo", "Central Research Institute Laboratory Infrastructure - Demo"],
            "Digital Infrastructure": ["State Data Center Cloud Tier-III Facility - Demo", "High-Speed Optical Fiber Connectivity to Gram Panchayats - Demo"],
            "Industrial Corridors": ["Smart Industrial Node Plug-and-Play Park - Demo", "Defense Industrial Corridor Testing Range Facility - Demo"],
            "Housing": ["Affordable Rental Housing Complex Scheme - Demo", "Urban In-Situ Slum Redevelopment Tower Complex - Demo"],
            "Telecommunications": ["4G/5G Border & Remote Connectivity Saturation Package - Demo", "Submarine OFC Cable Island Landing Station - Demo"]
        }

        contractors_sample = [
            "L&T Construction (Synthetic)", "Dilip Buildcon (Synthetic)", "Afcons Infrastructure (Synthetic)",
            "Tata Projects Ltd (Synthetic)", "HCC Ltd (Synthetic)", "Kalpataru Power (Synthetic)",
            "IRCON International (Synthetic)", "KNR Constructions (Synthetic)", "Megha Engineering (Synthetic)",
            "Ashoka Buildcon (Synthetic)", "PNC Infratech (Synthetic)", "BHEL Industrial (Synthetic)"
        ]

        # Target distribution: ~45% on-track, ~30% moderate risk, ~25% delayed/high-risk
        random.seed(42)

        for i in range(107, 177):
            pcode = f"P-{i}"
            sec_name = sectors_keys[(i * 7) % len(sectors_keys)]
            st_name = states_keys[(i * 11) % len(states_keys)]
            min_name = min_keys[(i * 3) % len(min_keys)]
            agency_name = agency_names[(i * 5) % len(agency_names)]
            titles = title_templates.get(sec_name, ["Infrastructure Project Package - Demo"])
            p_title = f"{titles[i % len(titles)]} ({st_name})"
            contractor = contractors_sample[i % len(contractors_sample)]

            cost_min, cost_max = sector_cost_ranges.get(sec_name, (300, 2000))
            app_cost = round(random.uniform(cost_min, cost_max), 2)

            # Dates
            start_year = random.choice([2021, 2022, 2023])
            start_month = random.randint(1, 12)
            s_date = datetime.date(start_year, start_month, 15)
            duration_months = random.randint(24, 48)
            planned_end = s_date + datetime.timedelta(days=duration_months * 30)

            # Categorize into bucket
            dice = random.random()
            if dice < 0.10: # Completed (10%)
                status = "Completed"
                planned_pct = 100.0
                actual_pct = 100.0
                spend_pct = round(random.uniform(97.0, 103.0), 1)
                expenditure = round(app_cost * (spend_pct / 100.0), 2)
                revised_cost = expenditure if expenditure > app_cost else None
                expected_end = planned_end + datetime.timedelta(days=random.randint(-15, 30))
                actual_end = expected_end
                risk_score = round(random.uniform(5.0, 20.0), 1)
                risk_band = "Low"
                delay_days = 0
                cost_overrun = round(((revised_cost - app_cost) / app_cost * 100), 2) if revised_cost else 0.0

            elif dice < 0.55: # On-track Active (45%)
                status = "Active"
                planned_pct = round(random.uniform(25.0, 85.0), 1)
                actual_pct = round(planned_pct - random.uniform(-3.0, 4.0), 1)
                spend_pct = round(actual_pct + random.uniform(-4.0, 5.0), 1)
                expenditure = round(app_cost * (spend_pct / 100.0), 2)
                revised_cost = None
                delay_days = random.randint(0, 25)
                expected_end = planned_end + datetime.timedelta(days=delay_days)
                actual_end = None
                risk_score = round(random.uniform(15.0, 34.0), 1)
                risk_band = "Low"
                cost_overrun = 0.0

            elif dice < 0.80: # Moderately at risk (25%)
                status = "Active"
                planned_pct = round(random.uniform(40.0, 85.0), 1)
                actual_pct = round(planned_pct - random.uniform(5.0, 12.0), 1)
                spend_pct = round(actual_pct + random.uniform(2.0, 12.0), 1)
                expenditure = round(app_cost * (spend_pct / 100.0), 2)
                revised_cost = round(app_cost * 1.08, 2) if random.random() < 0.5 else None
                delay_days = random.randint(35, 75)
                expected_end = planned_end + datetime.timedelta(days=delay_days)
                actual_end = None
                risk_score = round(random.uniform(35.0, 59.0), 1)
                risk_band = "Medium"
                cost_overrun = round(((revised_cost - app_cost) / app_cost * 100), 2) if revised_cost else 0.0

            else: # Delayed / High Risk (20%)
                status = "Delayed"
                planned_pct = round(random.uniform(55.0, 90.0), 1)
                actual_pct = round(planned_pct - random.uniform(14.0, 28.0), 1)
                spend_pct = round(actual_pct + random.uniform(12.0, 26.0), 1) # spend ahead of delivery
                expenditure = round(app_cost * (spend_pct / 100.0), 2)
                revised_cost = round(app_cost * random.uniform(1.12, 1.35), 2)
                delay_days = random.randint(80, 240)
                expected_end = planned_end + datetime.timedelta(days=delay_days)
                actual_end = None
                risk_score = round(random.uniform(62.0, 91.0), 1)
                risk_band = "High" if risk_score < 80 else "Critical"
                cost_overrun = round(((revised_cost - app_cost) / app_cost * 100), 2)

            # Coordinate within India
            lat = round(random.uniform(10.5, 29.5), 4)
            lng = round(random.uniform(73.5, 87.5), 4)

            proj = Project(
                project_code=pcode,
                name=p_title,
                description=f"Synthetic demonstration project for {sec_name} in {st_name}. Designed to model EVM analytics, risk triggers and explainable reporting.",
                ministry_id=ministry_map[min_name],
                department_id=None,
                sector_id=sector_map[sec_name],
                state_id=state_map[st_name],
                district_id=None,
                implementing_agency_id=agency_map[agency_name],
                contractor_name=contractor,
                approved_cost_cr=app_cost,
                revised_cost_cr=revised_cost,
                expenditure_cr=expenditure,
                start_date=s_date,
                planned_completion_date=planned_end,
                expected_completion_date=expected_end,
                actual_completion_date=actual_end,
                status=status,
                latitude=lat,
                longitude=lng,
                is_synthetic=True
            )
            db.add(proj)
            db.flush()

            # Milestones
            m_count = random.randint(3, 5)
            for m_idx in range(m_count):
                m_date = s_date + datetime.timedelta(days=(m_idx + 1) * (duration_months * 30 // (m_count + 1)))
                m_stat = "Completed" if actual_pct >= ((m_idx + 1) * 100 / m_count) else ("Delayed" if status == "Delayed" else "Pending")
                db.add(Milestone(
                    project_id=proj.id,
                    name=f"Milestone {m_idx + 1}: Package Execution Stage - Demo",
                    planned_date=m_date,
                    expected_date=m_date + datetime.timedelta(days=delay_days if m_stat == "Delayed" else 0),
                    actual_date=m_date if m_stat == "Completed" else None,
                    weight_pct=round(100.0 / m_count, 1),
                    status=m_stat
                ))

            # Progress update
            db.add(ProgressUpdate(
                project_id=proj.id,
                period_end=datetime.date(2024, 8, 31),
                planned_physical_pct=planned_pct,
                actual_physical_pct=actual_pct,
                financial_progress_pct=spend_pct,
                remarks=f"Routine progress review for {pcode}. Physical: {actual_pct}%, Financial: {spend_pct}%.",
                submitted_by="Project Engineer"
            ))

            # Financial record
            db.add(FinancialRecord(
                project_id=proj.id,
                fiscal_year="2024-25",
                quarter="Cumulative",
                allocated_cr=app_cost,
                released_cr=round(expenditure * 1.05, 2),
                expended_cr=expenditure
            ))

            # Risks
            if risk_band in ["High", "Critical"]:
                r_cat = random.choice(["Land Acquisition", "Procurement", "Weather", "Statutory Clearance", "Utility Shifting"])
                db.add(Risk(
                    project_id=proj.id,
                    category=r_cat,
                    severity=risk_band,
                    description=f"Significant operational impedance flagged under {r_cat} category.",
                    status="Open"
                ))
                db.add(Alert(
                    project_id=proj.id,
                    alert_type="Schedule Slippage" if delay_days > 60 else "Cost Gap",
                    severity=risk_band,
                    title=f"Early Warning: {risk_band.upper()} Risk on {pcode} ({sec_name})",
                    explanation=f"Project is facing {delay_days} days schedule slippage with risk score {risk_score}/100.",
                    evidence={"spi": round(actual_pct / max(1.0, planned_pct), 3), "risk_score": risk_score, "predicted_delay": delay_days},
                    status="Open"
                ))

            # Prediction record
            db.add(Prediction(
                project_id=proj.id,
                model_version="v1.0.0-xgb",
                risk_score=risk_score,
                risk_band=risk_band,
                predicted_delay_days=delay_days,
                predicted_cost_overrun_pct=cost_overrun,
                top_factors=[
                    {"feature": "physical_progress_gap", "impact": "Moderate", "contribution": 0.35, "description": f"Gap of {round(planned_pct - actual_pct, 1)}% points"},
                    {"feature": "budget_spend_velocity", "impact": "Baseline", "contribution": 0.25, "description": f"Spend at {spend_pct}%"}
                ],
                disclaimer="AI Prediction, not a confirmed fact"
            ))

        # -------------------------------------------------------------
        # 8. SEED DOCUMENTS & CHUNKS IN DB
        # -------------------------------------------------------------
        print("Indexing synthetic sample documents in database...")
        docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample_docs"))
        if os.path.exists(docs_dir):
            file_names = sorted(os.listdir(docs_dir))
            for fname in file_names:
                if not fname.endswith(".txt"):
                    continue
                fpath = os.path.join(docs_dir, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()

                # Infer project code
                assigned_project_id = p102.id
                if "P-101" in fname:
                    assigned_project_id = p101.id
                elif "P-103" in fname:
                    assigned_project_id = p103.id
                elif "P-104" in fname:
                    assigned_project_id = p104.id
                elif "P-105" in fname:
                    assigned_project_id = p105.id
                elif "P-106" in fname:
                    assigned_project_id = p106.id

                # Infer doc type
                doc_type = "Inspection Report"
                if "DPR" in fname:
                    doc_type = "DPR"
                elif "Meeting_Minutes" in fname:
                    doc_type = "Meeting Minutes"
                elif "Contractor" in fname:
                    doc_type = "Contractor Report"
                elif "Environmental" in fname or "Forest" in fname:
                    doc_type = "Environmental Report"
                elif "Progress" in fname:
                    doc_type = "Progress Report"
                elif "Circular" in fname:
                    doc_type = "Circular"
                elif "Financial" in fname or "Guidelines" in fname:
                    doc_type = "Financial Report"
                elif "Benchmark" in fname:
                    doc_type = "Review Report"

                title = fname.replace(".txt", "").replace("_", " ")

                doc = Document(
                    project_id=assigned_project_id,
                    doc_type=doc_type,
                    title=title,
                    file_path=f"data/sample_docs/{fname}",
                    sensitivity_level="Public",
                    uploaded_by="System Seed",
                    ingestion_status="Indexed",
                    checksum=hashlib.sha256(content.encode("utf-8")).hexdigest()
                )
                db.add(doc)
                db.flush()

                # Create 1-2 chunks
                chunks_text = [content[:900], content[800:]] if len(content) > 900 else [content]
                for c_idx, c_text in enumerate(chunks_text):
                    db.add(DocumentChunk(
                        document_id=doc.id,
                        chunk_index=c_idx,
                        page_no=c_idx + 1,
                        text=c_text.strip(),
                        embedding_id=f"emb_{doc.id}_{c_idx}"
                    ))

        # Commit all transactions
        db.commit()
        print("✅ Database seeding completed successfully!")
        print(f"Total projects created: {db.query(Project).count()}")
        print(f"Total documents created: {db.query(Document).count()}")
        print(f"Total demo users: {db.query(User).count()}")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
