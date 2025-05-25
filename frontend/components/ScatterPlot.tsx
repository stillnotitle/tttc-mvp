'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card } from '@/components/ui/card'

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

interface ScatterPlotProps {
  clusters: Cluster[]
  width?: number
  height?: number
}

export function ScatterPlot({ clusters, width = 800, height = 600 }: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<Argument | null>(null)

  useEffect(() => {
    if (!svgRef.current || !clusters.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // 全ての議論をフラット化
    const allArguments = clusters.flatMap(c => c.arguments)

    // スケールの設定
    const xExtent = d3.extent(allArguments, d => d.x) as [number, number]
    const yExtent = d3.extent(allArguments, d => d.y) as [number, number]

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([innerHeight, 0])

    // カラースケール
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    // SVGグループの設定
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // クラスターごとに点を描画
    clusters.forEach((cluster, i) => {
      const clusterGroup = g.append('g')
        .attr('class', `cluster-${cluster.cluster_id}`)

      // クラスターの中心を表す円
      clusterGroup.append('circle')
        .attr('cx', xScale(cluster.x))
        .attr('cy', yScale(cluster.y))
        .attr('r', Math.sqrt(cluster.size) * 10)
        .attr('fill', colorScale(cluster.cluster_id.toString()))
        .attr('opacity', 0.2)
        .attr('stroke', colorScale(cluster.cluster_id.toString()))
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedCluster(
          selectedCluster === cluster.cluster_id ? null : cluster.cluster_id
        ))

      // クラスターラベル
      clusterGroup.append('text')
        .attr('x', xScale(cluster.x))
        .attr('y', yScale(cluster.y) - Math.sqrt(cluster.size) * 10 - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', colorScale(cluster.cluster_id.toString()))
        .text(cluster.label)

      // 各議論の点
      clusterGroup.selectAll('.argument-point')
        .data(cluster.arguments)
        .enter()
        .append('circle')
        .attr('class', 'argument-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4)
        .attr('fill', colorScale(cluster.cluster_id.toString()))
        .attr('opacity', selectedCluster === null || selectedCluster === cluster.cluster_id ? 0.8 : 0.2)
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => setHoveredPoint(d))
        .on('mouseout', () => setHoveredPoint(null))
    })

    // 軸の追加
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('opacity', 0.3)

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('opacity', 0.3)

  }, [clusters, width, height, selectedCluster])

  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height} className="border rounded" />
      
      {hoveredPoint && (
        <Card className="absolute p-3 max-w-xs shadow-lg" style={{
          left: `${width / 2}px`,
          top: '10px',
          transform: 'translateX(-50%)'
        }}>
          <p className="text-sm font-medium mb-1">{hoveredPoint.summary}</p>
          <p className="text-xs text-gray-600">{hoveredPoint.argument}</p>
        </Card>
      )}
    </div>
  )
}
