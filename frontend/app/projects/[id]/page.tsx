'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScatterPlot } from '@/components/ScatterPlot'
import { ClusterDetails } from '@/components/ClusterDetails'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Download, Share2, Trash2, RefreshCw } from 'lucide-react'
import axios from 'axios'

interface ProjectDetails {
  id: string
  name: string
  description: string | null
  question: string
  created_at: string
  status: string
  analysis_status: string
  progress: number
  current_step: string
  error_message: string | null
}

interface ReportData {
  project_id: string
  project_name: string
  question: string
  total_comments: number
  total_arguments: number
  clusters: any[]
  takeaways: string[]
  metadata: any
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProjectDetails(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (project?.analysis_status === 'running') {
      const interval = setInterval(() => {
        fetchProjectDetails(project.id)
      }, 3000) // 3秒ごとに更新

      return () => clearInterval(interval)
    }
  }, [project?.analysis_status, project?.id])

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`)
      setProject(response.data)

      if (response.data.analysis_status === 'completed') {
        const reportResponse = await axios.get(`/api/projects/${projectId}/report`)
        setReport(reportResponse.data)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast({
        title: 'エラー',
        description: 'プロジェクトの読み込みに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このプロジェクトを削除してもよろしいですか？')) return

    try {
      await axios.delete(`/api/projects/${project?.id}`)
      toast({
        title: '削除完了',
        description: 'プロジェクトを削除しました',
      })
      router.push('/projects')
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'プロジェクトの削除に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleExport = () => {
    if (!report) return

    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${project?.name.replace(/\s+/g, '_')}_report.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto" />
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">プロジェクトが見つかりません</p>
            <Link href="/projects">
              <Button>プロジェクト一覧に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  プロジェクト一覧
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{project.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {report && (
                <>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    エクスポート
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    共有
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* プロジェクト情報 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>プロジェクト情報</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">質問</dt>
                <dd className="mt-1">{project.question}</dd>
              </div>
              {project.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">説明</dt>
                  <dd className="mt-1">{project.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">作成日時</dt>
                <dd className="mt-1">
                  {new Date(project.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="mt-1">
                  {project.analysis_status === 'completed' && (
                    <span className="text-green-600">分析完了</span>
                  )}
                  {project.analysis_status === 'running' && (
                    <span className="text-blue-600">分析中...</span>
                  )}
                  {project.analysis_status === 'failed' && (
                    <span className="text-red-600">エラー</span>
                  )}
                  {project.analysis_status === 'pending' && (
                    <span className="text-gray-600">準備中</span>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* 分析中の表示 */}
        {project.analysis_status === 'running' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                分析を実行中...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={project.progress} className="mb-4" />
              <p className="text-sm text-gray-600">{project.current_step}</p>
            </CardContent>
          </Card>
        )}

        {/* エラー表示 */}
        {project.analysis_status === 'failed' && project.error_message && (
          <Card className="mb-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">エラーが発生しました</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{project.error_message}</p>
            </CardContent>
          </Card>
        )}

        {/* 分析結果 */}
        {report && (
          <>
            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">総コメント数</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{report.total_comments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">抽出された議論</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{report.total_arguments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">クラスター数</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{report.clusters.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* 主な要点 */}
            {report.takeaways && report.takeaways.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>主な要点</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.takeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 散布図 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>議論の分布</CardTitle>
                <CardDescription>
                  クリックして詳細を表示
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScatterPlot 
                  clusters={report.clusters} 
                  width={800} 
                  height={600}
                />
              </CardContent>
            </Card>

            {/* クラスター詳細 */}
            <ClusterDetails 
              clusters={report.clusters}
              selectedClusterId={selectedClusterId}
              onClusterSelect={setSelectedClusterId}
            />
          </>
        )}
      </main>
    </div>
  )
}
