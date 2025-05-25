from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

class ProjectStatus(str, Enum):
    CREATED = "created"
    DATA_UPLOADED = "data_uploaded"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    ERROR = "error"

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AnalysisConfig(BaseModel):
    """分析の設定"""
    model: Optional[str] = "gpt-3.5-turbo"
    extraction_limit: Optional[int] = 1000
    extraction_workers: Optional[int] = 3
    num_clusters: Optional[int] = 8
    label_sample_size: Optional[int] = 20
    takeaway_sample_size: Optional[int] = 50
    languages: Optional[List[str]] = []
    custom_prompt: Optional[str] = None

class ProjectCreate(BaseModel):
    """プロジェクト作成時のリクエスト"""
    name: str = Field(..., description="プロジェクト名")
    description: Optional[str] = Field(None, description="プロジェクトの説明")
    question: str = Field(..., description="市民への質問内容")
    config: Optional[AnalysisConfig] = None

class ProjectResponse(BaseModel):
    """プロジェクトのレスポンス"""
    id: str
    name: str
    description: Optional[str]
    question: str
    created_at: datetime
    status: ProjectStatus
    analysis_status: AnalysisStatus
    config: Dict[str, Any]
    progress: Optional[int] = 0
    current_step: Optional[str] = ""
    error_message: Optional[str] = None

class CommentData(BaseModel):
    """コメントデータ"""
    comment_id: str
    comment_body: str
    agree: Optional[int] = None
    disagree: Optional[int] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ExtractedArgument(BaseModel):
    """抽出された議論"""
    argument_id: str
    comment_id: str
    argument: str
    summary: str
    cluster_id: Optional[int] = None

class ClusterData(BaseModel):
    """クラスターデータ"""
    cluster_id: int
    label: str
    summary: str
    arguments: List[ExtractedArgument]
    size: int
    x: float
    y: float

class ReportData(BaseModel):
    """レポートデータ"""
    project_id: str
    project_name: str
    question: str
    total_comments: int
    total_arguments: int
    clusters: List[ClusterData]
    takeaways: List[str]
    translations: Optional[Dict[str, Dict[str, str]]] = None
    metadata: Dict[str, Any]
    generated_at: datetime
