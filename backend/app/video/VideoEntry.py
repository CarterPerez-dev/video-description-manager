"""
ⒸAngelaMos | 2025
VideoEntry.py
"""

from __future__ import annotations

from uuid import UUID
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from config import Platform, SafeEnum
from core.Base import (
    Base,
    TimestampMixin,
    UUIDMixin,
)


class VideoEntry(Base, UUIDMixin, TimestampMixin):
    """
    Video entry for social media content management
    """
    __tablename__ = "video_entries"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    platform: Mapped[Platform] = mapped_column(
        SafeEnum(Platform),
        index=True,
    )

    video_number: Mapped[int] = mapped_column(Integer)

    description: Mapped[str] = mapped_column(Text, default="")

    youtube_description: Mapped[str | None] = mapped_column(
        Text,
        default=None,
    )

    scheduled_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
        index=True,
    )
