"""add supabase_sub to users

Revision ID: 0002_supabase
Revises: 0001_initial
Create Date: 2026-04-12
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_supabase"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("supabase_sub", sa.String(length=64), nullable=True))
    op.create_index(op.f("ix_users_supabase_sub"), "users", ["supabase_sub"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_supabase_sub"), table_name="users")
    op.drop_column("users", "supabase_sub")
