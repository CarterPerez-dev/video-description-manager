"""
ⒸAngelaMos | 2025
service.py
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from config import Platform
from core.exceptions import NotFoundError
from .VideoEntry import VideoEntry
from .repository import VideoEntryRepository
from .schemas import (
    VideoEntryCreate,
    VideoEntryUpdate,
    VideoEntryResponse,
    VideoEntryListResponse,
)


class VideoEntryService:
    """
    Business logic for video entry operations
    """
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_entry(
        self,
        user_id: UUID,
        data: VideoEntryCreate,
    ) -> VideoEntryResponse:
        """
        Create a new video entry
        """
        video_number = data.video_number
        if video_number == 0:
            video_number = await VideoEntryRepository.get_next_video_number(
                self.session,
                user_id,
                data.platform,
            )

        entry = await VideoEntryRepository.create(
            self.session,
            user_id=user_id,
            platform=data.platform,
            video_number=video_number,
            description=data.description,
            youtube_description=data.youtube_description,
            scheduled_time=data.scheduled_time,
        )
        return VideoEntryResponse.model_validate(entry)

    async def get_entry(
        self,
        entry_id: UUID,
        user_id: UUID,
    ) -> VideoEntryResponse:
        """
        Get a video entry by ID
        """
        entry = await VideoEntryRepository.get_by_id_and_user(
            self.session,
            entry_id,
            user_id,
        )
        if not entry:
            raise NotFoundError("Video entry not found")
        return VideoEntryResponse.model_validate(entry)

    async def update_entry(
        self,
        entry_id: UUID,
        user_id: UUID,
        data: VideoEntryUpdate,
    ) -> VideoEntryResponse:
        """
        Update a video entry
        """
        entry = await VideoEntryRepository.get_by_id_and_user(
            self.session,
            entry_id,
            user_id,
        )
        if not entry:
            raise NotFoundError("Video entry not found")

        update_dict = data.model_dump(exclude_unset=True)
        updated = await VideoEntryRepository.update(
            self.session,
            entry,
            **update_dict,
        )
        return VideoEntryResponse.model_validate(updated)

    async def delete_entry(
        self,
        entry_id: UUID,
        user_id: UUID,
    ) -> None:
        """
        Delete a video entry
        """
        entry = await VideoEntryRepository.get_by_id_and_user(
            self.session,
            entry_id,
            user_id,
        )
        if not entry:
            raise NotFoundError("Video entry not found")
        await VideoEntryRepository.delete(self.session, entry)

    async def list_entries(
        self,
        user_id: UUID,
        platform: Platform | None = None,
        page: int = 1,
        size: int = 20,
    ) -> VideoEntryListResponse:
        """
        List video entries with optional platform filter
        """
        skip = (page - 1) * size

        if platform:
            entries = await VideoEntryRepository.get_by_user_and_platform(
                self.session,
                user_id,
                platform,
                skip=skip,
                limit=size,
            )
        else:
            entries = await VideoEntryRepository.get_by_user(
                self.session,
                user_id,
                skip=skip,
                limit=size,
            )

        total = await VideoEntryRepository.count_by_user(
            self.session,
            user_id,
            platform,
        )

        return VideoEntryListResponse(
            items=[VideoEntryResponse.model_validate(e) for e in entries],
            total=total,
            page=page,
            size=size,
        )

    async def copy_to_platform(
        self,
        entry_id: UUID,
        user_id: UUID,
        target_platform: Platform,
        shorten_for_youtube: bool = True,
    ) -> VideoEntryResponse:
        """
        Copy a video entry to another platform
        """
        source = await VideoEntryRepository.get_by_id_and_user(
            self.session,
            entry_id,
            user_id,
        )
        if not source:
            raise NotFoundError("Video entry not found")

        next_number = await VideoEntryRepository.get_next_video_number(
            self.session,
            user_id,
            target_platform,
        )

        description = source.description
        youtube_desc = None

        if target_platform == Platform.YOUTUBE and shorten_for_youtube:
            youtube_desc = source.youtube_description or self._shorten_description(description)
            description = youtube_desc

        new_entry = await VideoEntryRepository.create(
            self.session,
            user_id=user_id,
            platform=target_platform,
            video_number=next_number,
            description=description,
            youtube_description=youtube_desc if target_platform == Platform.YOUTUBE else None,
            scheduled_time=source.scheduled_time,
        )
        return VideoEntryResponse.model_validate(new_entry)

    def _shorten_description(self, text: str, max_length: int = 100) -> str:
        """
        Shorten description for YouTube Shorts
        """
        if len(text) <= max_length:
            return text
        return text[:max_length - 3].rsplit(" ", 1)[0] + "..."
