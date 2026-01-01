"""
ⒸAngelaMos | 2025
repository.py
"""

from uuid import UUID
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import Platform
from core.base_repository import BaseRepository
from .VideoEntry import VideoEntry


class VideoEntryRepository(BaseRepository[VideoEntry]):
    """
    Repository for VideoEntry model database operations
    """
    model = VideoEntry

    @classmethod
    async def get_by_user(
        cls,
        session: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[VideoEntry]:
        """
        Get all video entries for a user
        """
        result = await session.execute(
            select(VideoEntry)
            .where(VideoEntry.user_id == user_id)
            .order_by(VideoEntry.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    @classmethod
    async def get_by_user_and_platform(
        cls,
        session: AsyncSession,
        user_id: UUID,
        platform: Platform,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[VideoEntry]:
        """
        Get video entries for a user filtered by platform
        """
        result = await session.execute(
            select(VideoEntry)
            .where(
                VideoEntry.user_id == user_id,
                VideoEntry.platform == platform,
            )
            .order_by(VideoEntry.video_number.asc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    @classmethod
    async def count_by_user(
        cls,
        session: AsyncSession,
        user_id: UUID,
        platform: Platform | None = None,
    ) -> int:
        """
        Count video entries for a user, optionally filtered by platform
        """
        from sqlalchemy import func
        query = select(func.count()).select_from(VideoEntry).where(
            VideoEntry.user_id == user_id
        )
        if platform:
            query = query.where(VideoEntry.platform == platform)
        result = await session.execute(query)
        return result.scalar_one()

    @classmethod
    async def get_next_video_number(
        cls,
        session: AsyncSession,
        user_id: UUID,
        platform: Platform,
    ) -> int:
        """
        Get the next available video number for a platform
        """
        from sqlalchemy import func
        result = await session.execute(
            select(func.max(VideoEntry.video_number))
            .where(
                VideoEntry.user_id == user_id,
                VideoEntry.platform == platform,
            )
        )
        max_num = result.scalar_one_or_none()
        return (max_num or 0) + 1

    @classmethod
    async def get_by_id_and_user(
        cls,
        session: AsyncSession,
        entry_id: UUID,
        user_id: UUID,
    ) -> VideoEntry | None:
        """
        Get a video entry by ID, ensuring it belongs to the user
        """
        result = await session.execute(
            select(VideoEntry).where(
                VideoEntry.id == entry_id,
                VideoEntry.user_id == user_id,
            )
        )
        return result.scalars().first()
