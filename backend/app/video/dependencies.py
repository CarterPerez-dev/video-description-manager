"""
ⒸAngelaMos | 2025
dependencies.py
"""

from typing import Annotated

from fastapi import Depends

from core.dependencies import DBSession
from .service import VideoEntryService


def get_video_service(db: DBSession) -> VideoEntryService:
    """
    Dependency to inject VideoEntryService instance
    """
    return VideoEntryService(db)


VideoServiceDep = Annotated[VideoEntryService, Depends(get_video_service)]
