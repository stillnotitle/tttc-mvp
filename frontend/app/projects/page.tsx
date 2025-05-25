'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Project {
  id: string
  name: string
  description: string | null
  question: string
  created_at: string
  status: string
  analysis_status: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了'
      case 'running':
        return '分析中'
      case 'failed':
        return 'エラー'
      default:
        return '準備中'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Talk to the City MVP
            </h1>
          </Link>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新しいプロジェクト
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">プロジェクト一覧</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto" />
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">まだプロジェクトがありません</p>
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のプロジェクトを作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(project.analysis_status)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(project.analysis_status)}
                        </span>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {project.description || project.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(project.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
