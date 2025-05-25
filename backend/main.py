from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
import shutil
from datetime import datetime
from typing import Optional, List
import json
import uuid

from api.models import (
    ProjectCreate,
    ProjectResponse,
    ProjectStatus,
    AnalysisStatus,
    AnalysisConfig
)
from api.pipeline_runner import PipelineRunner
from config import settings

# Create necessary directories
for dir_path in [settings.UPLOAD_DIR, settings.OUTPUT_DIR, settings.LOG_DIR]:
    os.makedirs(dir_path, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"Starting TttC MVP API...")
    print(f"Upload directory: {settings.UPLOAD_DIR}")
    print(f"Output directory: {settings.OUTPUT_DIR}")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="Talk to the City MVP API",
    description="API for analyzing citizen comments and generating interactive reports",
    version="0.1.0",
    lifespan=lifespan
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では制限する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo (本番環境ではデータベースを使用)
projects_db = {}
pipeline_runner = PipelineRunner()

@app.get("/")
async def root():
    return {
        "message": "Talk to the City MVP API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    background_tasks: BackgroundTasks
):
    """新しいプロジェクトを作成"""
    project_id = str(uuid.uuid4())
    
    # プロジェクトデータを保存
    project_data = {
        "id": project_id,
        "name": project.name,
        "description": project.description,
        "question": project.question,
        "created_at": datetime.now(),
        "status": ProjectStatus.CREATED,
        "analysis_status": AnalysisStatus.PENDING,
        "config": project.config.dict() if project.config else AnalysisConfig().dict()
    }
    
    projects_db[project_id] = project_data
    
    return ProjectResponse(**project_data)

@app.post("/api/projects/{project_id}/upload")
async def upload_csv(
    project_id: str,
    file: UploadFile = File(...)
):
    """CSVファイルをアップロード"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    # ファイルを保存
    file_path = os.path.join(settings.UPLOAD_DIR, f"{project_id}.csv")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        projects_db[project_id]["csv_path"] = file_path
        projects_db[project_id]["status"] = ProjectStatus.DATA_UPLOADED
        
        return {"message": "File uploaded successfully", "project_id": project_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/projects/{project_id}/analyze")
async def start_analysis(
    project_id: str,
    background_tasks: BackgroundTasks
):
    """分析を開始"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    if project["status"] != ProjectStatus.DATA_UPLOADED:
        raise HTTPException(status_code=400, detail="Please upload data first")
    
    # バックグラウンドで分析を実行
    project["analysis_status"] = AnalysisStatus.RUNNING
    background_tasks.add_task(
        pipeline_runner.run_analysis,
        project_id,
        project["csv_path"],
        project["config"],
        projects_db
    )
    
    return {"message": "Analysis started", "project_id": project_id}

@app.get("/api/projects", response_model=List[ProjectResponse])
async def list_projects():
    """プロジェクト一覧を取得"""
    return [ProjectResponse(**project) for project in projects_db.values()]

@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """プロジェクトの詳細を取得"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(**projects_db[project_id])

@app.get("/api/projects/{project_id}/status")
async def get_analysis_status(project_id: str):
    """分析の進行状況を取得"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    return {
        "project_id": project_id,
        "status": project["status"],
        "analysis_status": project["analysis_status"],
        "progress": project.get("progress", 0),
        "current_step": project.get("current_step", "")
    }

@app.get("/api/projects/{project_id}/report")
async def get_report(project_id: str):
    """生成されたレポートデータを取得"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    if project["analysis_status"] != AnalysisStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Analysis not completed yet")
    
    # レポートデータを読み込む
    report_path = os.path.join(settings.OUTPUT_DIR, project_id, "result.json")
    
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found")
    
    with open(report_path, "r", encoding="utf-8") as f:
        report_data = json.load(f)
    
    return report_data

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """プロジェクトを削除"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # ファイルを削除
    project = projects_db[project_id]
    
    if "csv_path" in project and os.path.exists(project["csv_path"]):
        os.remove(project["csv_path"])
    
    output_dir = os.path.join(settings.OUTPUT_DIR, project_id)
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    
    del projects_db[project_id]
    
    return {"message": "Project deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
