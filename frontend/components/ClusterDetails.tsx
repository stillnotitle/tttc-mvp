'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Users } from 'lucide-react'

interface Argument {
  argument_id: string
  comment_id: string
  argument: string
  summary: string
  x: number
  y: number
}

interface Cluster {
  cluster_id: number
  label: string
  summary: string
  size: number
  x: number
  y: number
  arguments: Argument[]
}

interface ClusterDetailsProps {
  clusters: Cluster[]
  selectedClusterId: number | null
  onClusterSelect: (clusterId: number | null) => void
}

export function ClusterDetails({ 
  clusters, 
  selectedClusterId, 
  onClusterSelect 
}: ClusterDetailsProps) {
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set())

  const toggleCluster = (clusterId: number) => {
    const newExpanded = new Set(expandedClusters)
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId)
    } else {
      newExpanded.add(clusterId)
    }
    setExpandedClusters(newExpanded)
  }

  // クラスターをサイズでソート
  const sortedClusters = [...clusters].sort((a, b) => b.size - a.size)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">クラスター詳細</h2>
      
      {sortedClusters.map((cluster) => {
        const isExpanded = expandedClusters.has(cluster.cluster_id)
        const isSelected = selectedClusterId === cluster.cluster_id

        return (
          <Card 
            key={cluster.cluster_id}
            className={`transition-all duration-200 ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader className="cursor-pointer" onClick={() => toggleCluster(cluster.cluster_id)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center">
                    <span className={`w-4 h-4 rounded-full mr-3`} 
                      style={{ backgroundColor: getClusterColor(cluster.cluster_id) }}
                    />
                    {cluster.label}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {cluster.summary}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{cluster.size}</span>
                    </div>
                    <p className="text-xs text-gray-500">意見数</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">
                    このクラスターの意見一覧:
                  </h4>
                  {cluster.arguments.map((argument, index) => (
                    <div 
                      key={argument.argument_id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="font-medium text-sm mb-1">
                        {index + 1}. {argument.summary}
                      </p>
                      <p className="text-sm text-gray-600">
                        {argument.argument}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        コメントID: {argument.comment_id}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// クラスターIDから色を生成
function getClusterColor(clusterId: number): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16', // lime
    '#ec4899', // pink
  ]
  return colors[clusterId % colors.length]
}
