"""
ⒸAngelaMos | 2025
routes.py
"""

from uuid import UUID

from fastapi import (
    APIRouter,
    Query,
    status,
)

from config import Platform
from core.dependencies import CurrentUser
from core.responses import (
    AUTH_401,
    NOT_FOUND_404,
)
from .schemas import (
    CopyToTargetRequest,
    VideoEntryCreate,
    VideoEntryListResponse,
    VideoEntryResponse,
    VideoEntryUpdate,
)
from .dependencies import VideoServiceDep


router = APIRouter(prefix="/videos", tags=["videos"])


@router.post(
    "",
    response_model=VideoEntryResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**AUTH_401},
)
async def create_video_entry(
    video_service: VideoServiceDep,
    current_user: CurrentUser,
    data: VideoEntryCreate,
) -> VideoEntryResponse:
    """
    Create a new video entry
    """
    return await video_service.create_entry(current_user.id, data)


@router.get(
    "",
    response_model=VideoEntryListResponse,
    responses={**AUTH_401},
)
async def list_video_entries(
    video_service: VideoServiceDep,
    current_user: CurrentUser,
    platform: Platform | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> VideoEntryListResponse:
    """
    List video entries with optional platform filter
    """
    return await video_service.list_entries(
        current_user.id,
        platform=platform,
        page=page,
        size=size,
    )


@router.get(
    "/{entry_id}",
    response_model=VideoEntryResponse,
    responses={**AUTH_401, **NOT_FOUND_404},
)
async def get_video_entry(
    video_service: VideoServiceDep,
    current_user: CurrentUser,
    entry_id: UUID,
) -> VideoEntryResponse:
    """
    Get a video entry by ID
    """
    return await video_service.get_entry(entry_id, current_user.id)


@router.patch(
    "/{entry_id}",
    response_model=VideoEntryResponse,
    responses={**AUTH_401, **NOT_FOUND_404},
)
async def update_video_entry(
    video_service: VideoServiceDep,
    current_user: CurrentUser,
    entry_id: UUID,
    data: VideoEntryUpdate,
) -> VideoEntryResponse:
    """
    Update a video entry
    """
    return await video_service.update_entry(entry_id, current_user.id, data)


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={**AUTH_401, **NOT_FOUND_404},
)
async def delete_video_entry(
    video_service: VideoServiceDep,
    current_user: CurrentUser,
    entry_id: UUID,
) -> None:
    """
    Delete a video entry
    """
    await video_service.delete_entry(entry_id, current_user.id)


@router.post(
    "/{entry_id}/copy",
    response_model=VideoEntryResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**AUTH_401, **NOT_FOUND_404},
)
async def copy_video_entry(
    video_service: VideoServiceDep,
    current_user: CurrentUser,
    entry_id: UUID,
    data: CopyToTargetRequest,
) -> VideoEntryResponse:
    """
    Copy a video entry to another platform
    """
    return await video_service.copy_to_platform(
        entry_id,
        current_user.id,
        data.target_platform,
        data.shorten_for_youtube,
    )
