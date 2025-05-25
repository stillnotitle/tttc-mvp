'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { FileUpload } from '@/components/FileUpload'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    question: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: 'エラー',
        description: 'CSVファイルを選択してください',
        variant: 'destructive',
      })
      return
    }

    if (!formData.name || !formData.question) {
      toast({
        title: 'エラー',
        description: 'プロジェクト名と質問は必須です',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // 1. プロジェクトを作成
      const projectResponse = await axios.post('/api/projects', formData)
      const projectId = projectResponse.data.id

      // 2. CSVファイルをアップロード
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      await axios.post(`/api/projects/${projectId}/upload`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // 3. 分析を開始
      await axios.post(`/api/projects/${projectId}/analyze`)

      toast({
        title: '成功',
        description: 'プロジェクトを作成し、分析を開始しました',
      })

      // プロジェクト詳細ページへ遷移
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'エラー',
        description: 'プロジェクトの作成に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/projects">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            プロジェクト一覧に戻る
          </Button>
        </Link>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">新しいプロジェクトを作成</CardTitle>
            <CardDescription>
              市民からのコメントを分析するための新しいプロジェクトを作成します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">プロジェクト名 *</Label>
                <Input
                  id="name"
                  placeholder="例: 市民意見収集2024"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">プロジェクトの説明</Label>
                <Textarea
                  id="description"
                  placeholder="プロジェクトの目的や背景を説明してください"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">市民への質問 *</Label>
                <Textarea
                  id="question"
                  placeholder="例: 地域の公園整備について、どのような機能や設備が必要だと思いますか？"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  disabled={isLoading}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>CSVファイル *</Label>
                <FileUpload onFileSelect={setFile} disabled={isLoading} />
                <p className="text-sm text-gray-500">
                  必須カラム: comment-id, comment-body
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !file}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    'プロジェクトを作成して分析を開始'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
