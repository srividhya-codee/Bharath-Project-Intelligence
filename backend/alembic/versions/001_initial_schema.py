"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-24 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Ministries
    op.create_table(
        'ministries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('short_name', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ministries_code'), 'ministries', ['code'], unique=True)
    op.create_index(op.f('ix_ministries_id'), 'ministries', ['id'], unique=False)

    # 2. Departments
    op.create_table(
        'departments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ministry_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['ministry_id'], ['ministries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_departments_id'), 'departments', ['id'], unique=False)
    op.create_index(op.f('ix_departments_ministry_id'), 'departments', ['ministry_id'], unique=False)

    # 3. Implementing Agencies
    op.create_table(
        'implementing_agencies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_implementing_agencies_id'), 'implementing_agencies', ['id'], unique=False)
    op.create_index(op.f('ix_implementing_agencies_name'), 'implementing_agencies', ['name'], unique=False)

    # 4. States
    op.create_table(
        'states',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=10), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('region', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_states_code'), 'states', ['code'], unique=True)
    op.create_index(op.f('ix_states_id'), 'states', ['id'], unique=False)
    op.create_index(op.f('ix_states_name'), 'states', ['name'], unique=False)

    # 5. Districts
    op.create_table(
        'districts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('state_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['state_id'], ['states.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_districts_id'), 'districts', ['id'], unique=False)
    op.create_index(op.f('ix_districts_name'), 'districts', ['name'], unique=False)
    op.create_index(op.f('ix_districts_state_id'), 'districts', ['state_id'], unique=False)

    # 6. Sectors
    op.create_table(
        'sectors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sectors_id'), 'sectors', ['id'], unique=False)
    op.create_index(op.f('ix_sectors_name'), 'sectors', ['name'], unique=True)

    # 7. Projects
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('ministry_id', sa.Integer(), nullable=False),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('sector_id', sa.Integer(), nullable=False),
        sa.Column('state_id', sa.Integer(), nullable=False),
        sa.Column('district_id', sa.Integer(), nullable=True),
        sa.Column('implementing_agency_id', sa.Integer(), nullable=False),
        sa.Column('contractor_name', sa.String(length=255), nullable=True),
        sa.Column('project_manager_id', sa.Integer(), nullable=True),
        sa.Column('approved_cost_cr', sa.Float(), nullable=False),
        sa.Column('revised_cost_cr', sa.Float(), nullable=True),
        sa.Column('expenditure_cr', sa.Float(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('planned_completion_date', sa.Date(), nullable=False),
        sa.Column('expected_completion_date', sa.Date(), nullable=False),
        sa.Column('actual_completion_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('is_synthetic', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ),
        sa.ForeignKeyConstraint(['implementing_agency_id'], ['implementing_agencies.id'], ),
        sa.ForeignKeyConstraint(['ministry_id'], ['ministries.id'], ),
        sa.ForeignKeyConstraint(['sector_id'], ['sectors.id'], ),
        sa.ForeignKeyConstraint(['state_id'], ['states.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_project_code'), 'projects', ['project_code'], unique=True)
    op.create_index(op.f('ix_projects_status'), 'projects', ['status'], unique=False)

    # 8. Milestones
    op.create_table(
        'milestones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('planned_date', sa.Date(), nullable=False),
        sa.Column('expected_date', sa.Date(), nullable=False),
        sa.Column('actual_date', sa.Date(), nullable=True),
        sa.Column('weight_pct', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_milestones_id'), 'milestones', ['id'], unique=False)
    op.create_index(op.f('ix_milestones_project_id'), 'milestones', ['project_id'], unique=False)

    # 9. Progress Updates
    op.create_table(
        'progress_updates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('planned_physical_pct', sa.Float(), nullable=False),
        sa.Column('actual_physical_pct', sa.Float(), nullable=False),
        sa.Column('financial_progress_pct', sa.Float(), nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('submitted_by', sa.String(length=100), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_progress_updates_id'), 'progress_updates', ['id'], unique=False)
    op.create_index(op.f('ix_progress_updates_period_end'), 'progress_updates', ['period_end'], unique=False)
    op.create_index(op.f('ix_progress_updates_project_id'), 'progress_updates', ['project_id'], unique=False)

    # 10. Financial Records
    op.create_table(
        'financial_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('fiscal_year', sa.String(length=20), nullable=False),
        sa.Column('quarter', sa.String(length=10), nullable=False),
        sa.Column('allocated_cr', sa.Float(), nullable=False),
        sa.Column('released_cr', sa.Float(), nullable=False),
        sa.Column('expended_cr', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_financial_records_id'), 'financial_records', ['id'], unique=False)
    op.create_index(op.f('ix_financial_records_fiscal_year'), 'financial_records', ['fiscal_year'], unique=False)

    # 11. Risks
    op.create_table(
        'risks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_risks_category'), 'risks', ['category'], unique=False)
    op.create_index(op.f('ix_risks_id'), 'risks', ['id'], unique=False)

    # 12. Issues
    op.create_table(
        'issues',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('raised_by', sa.String(length=100), nullable=True),
        sa.Column('raised_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('resolution', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_issues_id'), 'issues', ['id'], unique=False)

    # 13. Documents
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('doc_type', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('sensitivity_level', sa.String(length=50), nullable=True),
        sa.Column('uploaded_by', sa.String(length=100), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.Column('ingestion_status', sa.String(length=50), nullable=True),
        sa.Column('checksum', sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_doc_type'), 'documents', ['doc_type'], unique=False)
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)

    # 14. Document Chunks
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('page_no', sa.Integer(), nullable=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('embedding_id', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_chunks_document_id'), 'document_chunks', ['document_id'], unique=False)
    op.create_index(op.f('ix_document_chunks_id'), 'document_chunks', ['id'], unique=False)

    # 15. Predictions
    op.create_table(
        'predictions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False),
        sa.Column('risk_band', sa.String(length=50), nullable=False),
        sa.Column('predicted_delay_days', sa.Integer(), nullable=False),
        sa.Column('predicted_cost_overrun_pct', sa.Float(), nullable=False),
        sa.Column('top_factors', sa.JSON(), nullable=True),
        sa.Column('generated_at', sa.DateTime(), nullable=False),
        sa.Column('disclaimer', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_predictions_id'), 'predictions', ['id'], unique=False)

    # 16. Alerts
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('alert_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('evidence', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_id'), 'alerts', ['id'], unique=False)
    op.create_index(op.f('ix_alerts_status'), 'alerts', ['status'], unique=False)

    # 17. Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('ministry_id', sa.Integer(), nullable=True),
        sa.Column('state_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['ministry_id'], ['ministries.id'], ),
        sa.ForeignKeyConstraint(['state_id'], ['states.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    # 18. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=True),
        sa.Column('entity_id', sa.String(length=100), nullable=True),
        sa.Column('before', sa.JSON(), nullable=True),
        sa.Column('after', sa.JSON(), nullable=True),
        sa.Column('ip', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)

    # 19. Chat Sessions & Messages
    op.create_table(
        'chat_sessions',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(length=50), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tools_used', sa.JSON(), nullable=True),
        sa.Column('sources', sa.JSON(), nullable=True),
        sa.Column('confidence', sa.String(length=20), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_messages_id'), 'chat_messages', ['id'], unique=False)
    op.create_index(op.f('ix_chat_messages_session_id'), 'chat_messages', ['session_id'], unique=False)


def downgrade() -> None:
    op.drop_table('chat_messages')
    op.drop_table('chat_sessions')
    op.drop_table('audit_logs')
    op.drop_table('users')
    op.drop_table('alerts')
    op.drop_table('predictions')
    op.drop_table('document_chunks')
    op.drop_table('documents')
    op.drop_table('issues')
    op.drop_table('risks')
    op.drop_table('financial_records')
    op.drop_table('progress_updates')
    op.drop_table('milestones')
    op.drop_table('projects')
    op.drop_table('sectors')
    op.drop_table('districts')
    op.drop_table('states')
    op.drop_table('implementing_agencies')
    op.drop_table('departments')
    op.drop_table('ministries')
