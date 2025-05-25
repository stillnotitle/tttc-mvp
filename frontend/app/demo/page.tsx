'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScatterPlot } from '@/components/ScatterPlot'
import { ClusterDetails } from '@/components/ClusterDetails'
import { ArrowLeft, Info } from 'lucide-react'

// デモ用のサンプルデータ
const demoData = {
  project_name: "市民公園整備に関する意見収集",
  question: "地域の公園整備について、どのような機能や設備が必要だと思いますか？",
  total_comments: 150,
  total_arguments: 287,
  clusters: [
    {
      cluster_id: 0,
      label: "子供の遊び場充実",
      summary: "安全な遊具やじゃぶじゃぶ池など、子供が楽しめる設備の要望",
      size: 45,
      x: -2.5,
      y: 1.8,
      arguments: [
        {
          argument_id: "arg_1",
          comment_id: "1",
          argument: "公園には子供が安全に遊べる遊具エリアが必要です。特に幼児向けの低い滑り台やブランコがあると良いと思います。",
          summary: "幼児向け遊具の設置要望",
          x: -2.3,
          y: 1.9
        },
        {
          argument_id: "arg_2",
          comment_id: "9",
          argument: "子供向けの水遊び場があると夏場に助かります。じゃぶじゃぶ池のような浅い水場で、安全に遊べる施設を希望します。",
          summary: "水遊び場の設置要望",
          x: -2.7,
          y: 1.7
        }
      ]
    },
    {
      cluster_id: 1,
      label: "高齢者への配慮",
      summary: "ベンチ、日陰、バリアフリー化など高齢者が利用しやすい環境整備",
      size: 38,
      x: 1.2,
      y: 2.3,
      arguments: [
        {
          argument_id: "arg_3",
          comment_id: "2",
          argument: "高齢者が利用しやすいベンチや日陰になる東屋をもっと増やしてほしいです。散歩の途中で休憩できる場所が少ないと感じています。",
          summary: "休憩設備の増設要望",
          x: 1.1,
          y: 2.4
        },
        {
          argument_id: "arg_4",
          comment_id: "8",
          argument: "バリアフリー対応を充実させてほしいです。車椅子でも利用しやすいスロープや、多目的トイレの設置をお願いします。",
          summary: "バリアフリー化の要望",
          x: 1.3,
          y: 2.2
        }
      ]
    },
    {
      cluster_id: 2,
      label: "ペット対応施設",
      summary: "ドッグランなどペットと一緒に利用できる施設の要望",
      size: 32,
      x: -1.5,
      y: -1.2,
      arguments: [
        {
          argument_id: "arg_5",
          comment_id: "3",
          argument: "ドッグランエリアを設置してほしいです。犬を飼っている人が増えているので、安心して犬を遊ばせられるスペースがあると助かります。",
          summary: "ドッグラン設置要望",
          x: -1.4,
          y: -1.3
        }
      ]
    },
    {
      cluster_id: 3,
      label: "安全・防犯対策",
      summary: "照明の充実や防犯カメラ設置など、安全面の改善要望",
      size: 41,
      x: 2.8,
      y: -0.5,
      arguments: [
        {
          argument_id: "arg_6",
          comment_id: "4",
          argument: "夜間の照明を充実させてください。暗くて怖いので、夕方以降は利用を避けています。防犯カメラの設置も検討してほしいです。",
          summary: "夜間照明と防犯設備",
          x: 2.7,
          y: -0.4
        }
      ]
    }
  ],
  takeaways: [
    "最も多くの意見が集まったテーマは「子供の遊び場充実」で、45件の議論がありました。",
    "議論は大きく4つのテーマに分類されました。",
    "安全性（防犯・バリアフリー）に関する要望が多く見られました。"
  ]
}

export default function DemoPage() {
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  ホームに戻る
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">デモ - {demoData.project_name}</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <Info className="h-4 w-4" />
              <span>これはデモデータです</span>
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
                <dd className="mt-1">{demoData.question}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">分析日時</dt>
                <dd className="mt-1">2024年5月25日 14:30（デモデータ）</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">総コメント数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{demoData.total_comments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">抽出された議論</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{demoData.total_arguments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">クラスター数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{demoData.clusters.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* 主な要点 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>主な要点</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {demoData.takeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 散布図 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>議論の分布</CardTitle>
            <CardDescription>
              クリックして詳細を表示
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ScatterPlot 
              clusters={demoData.clusters} 
              width={800} 
              height={600}
            />
          </CardContent>
        </Card>

        {/* クラスター詳細 */}
        <ClusterDetails 
          clusters={demoData.clusters}
          selectedClusterId={selectedClusterId}
          onClusterSelect={setSelectedClusterId}
        />

        {/* CTAセクション */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">
              実際に分析を試してみませんか？
            </h3>
            <p className="text-lg mb-6 opacity-90">
              あなたの組織のデータで、市民の声を可視化しましょう
            </p>
            <Link href="/projects/new">
              <Button size="lg" variant="secondary">
                新しいプロジェクトを開始
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
