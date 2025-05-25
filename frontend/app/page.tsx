'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BarChart3, Users, ArrowRight, Upload, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const features = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: '簡単アップロード',
      description: 'CSVファイルをドラッグ&ドロップするだけで分析開始',
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'AI自動分析',
      description: 'OpenAI APIを使用して意見を自動的に抽出・分類',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'インタラクティブな可視化',
      description: '議論の分布を視覚的に探索できる散布図',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: '共有機能',
      description: '生成されたレポートを簡単に共有',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヘッダー */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Talk to the City MVP
          </h1>
          <Link href="/projects">
            <Button>プロジェクト一覧</Button>
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          市民の声を、見える形に
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Talk to the City MVPは、自治体職員が市民からのコメントやフィードバックを
          簡単に分析・可視化できるツールです
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/projects/new">
            <Button size="lg" className="text-lg px-8 py-6">
              新しいプロジェクトを開始
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              デモを見る
            </Button>
          </Link>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">主な機能</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              onMouseEnter={() => setIsHovered(feature.title)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <CardHeader>
                <div
                  className={`mb-4 text-blue-600 transition-transform duration-300 ${
                    isHovered === feature.title ? 'scale-110' : ''
                  }`}
                >
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA セクション */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold mb-4">
              今すぐ市民の声を可視化しませんか？
            </h3>
            <p className="text-xl mb-8 opacity-90">
              無料で始められます。クレジットカード不要。
            </p>
            <Link href="/projects/new">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* フッター */}
      <footer className="border-t bg-gray-50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2024 Talk to the City MVP. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Based on{' '}
            <a
              href="https://github.com/AIObjectives/talk-to-the-city-reports"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to the City
            </a>{' '}
            by AI Objectives Institute
          </p>
        </div>
      </footer>
    </div>
  )
}
