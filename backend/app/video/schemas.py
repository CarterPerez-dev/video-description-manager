"""
ⒸAngelaMos | 2025
schemas.py
"""

from datetime import datetime

from pydantic import Field

from config import Platform
from core.base_schema import (
    BaseSchema,
    BaseResponseSchema,
)


class VideoEntryCreate(BaseSchema):
    """
    Schema for creating a video entry
    """
    platform: Platform
    video_number: int = Field(ge=1)
    description: str = ""
    youtube_description: str | None = None
    scheduled_time: datetime | None = None


class VideoEntryUpdate(BaseSchema):
    """
    Schema for updating a video entry
    """
    description: str | None = None
    youtube_description: str | None = None
    scheduled_time: datetime | None = None
    video_number: int | None = Field(default=None, ge=1)


class VideoEntryResponse(BaseResponseSchema):
    """
    Schema for video entry API responses
    """
    platform: Platform
    video_number: int
    description: str
    youtube_description: str | None
    scheduled_time: datetime | None


class VideoEntryListResponse(BaseSchema):
    """
    Schema for paginated video entry list
    """
    items: list[VideoEntryResponse]
    total: int
    page: int
    size: int


class CopyToTargetRequest(BaseSchema):
    """
    Schema for copying a video entry to another platform
    """
    target_platform: Platform
    shorten_for_youtube: bool = True
