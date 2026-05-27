"""make_lesson_content_nullable_add_description

Revision ID: 7a7651884f14
Revises: 9ad080d98614
Create Date: 2026-05-27

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7a7651884f14"
down_revision: Union[str, Sequence[str], None] = "9ad080d98614"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make content nullable — lessons are now populated lazily on first access
    op.alter_column(
        "module_lessons",
        "content",
        existing_type=sa.Text(),
        nullable=True,
    )
    # Add description column to store the lesson description from the AI plan
    op.add_column(
        "module_lessons",
        sa.Column("description", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("module_lessons", "description")
    op.alter_column(
        "module_lessons",
        "content",
        existing_type=sa.Text(),
        nullable=False,
    )
