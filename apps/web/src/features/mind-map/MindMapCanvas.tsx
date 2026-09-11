'use client';

import React, { useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layers, Search, Sparkles } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 100 },
    data: { label: 'Gemini 3.8 Flash' },
    style: { background: '#18181b', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px' },
  },
  {
    id: '2',
    position: { x: 100, y: 220 },
    data: { label: 'Graph RAG Ontology' },
    style: { background: '#18181b', color: '#34d399', border: '1px solid #10b981', borderRadius: '8px', padding: '10px' },
  },
  {
    id: '3',
    position: { x: 400, y: 220 },
    data: { label: 'Full-Duplex AudioWorklet' },
    style: { background: '#18181b', color: '#f472b6', border: '1px solid #ec4899', borderRadius: '8px', padding: '10px' },
  },
  {
    id: '4',
    position: { x: 250, y: 340 },
    data: { label: 'Remotion 4.x Video Studio' },
    style: { background: '#18181b', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'EXTRACTS', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e1-3', source: '1', target: '3', label: 'STREAMS_TO', animated: true, style: { stroke: '#ec4899' } },
  { id: 'e2-4', source: '2', target: '4', label: 'VISUALIZES', style: { stroke: '#10b981' } },
  { id: 'e3-4', source: '3', target: '4', label: 'SYNCS_AUDIO', style: { stroke: '#f59e0b' } },
];

interface MindMapCanvasProps {
  activeEntityId?: string | null;
  onSelectEntity?: (label: string, entityId: string) => void;
}

export function MindMapCanvas({ activeEntityId, onSelectEntity }: MindMapCanvasProps = {}) {
  const [selectedNode, setSelectedNode] = useState<string | null>('Gemini 3.8 Flash');

  // Compute node styling dynamically based on active audio playback
  const styledNodes = initialNodes.map((node) => {
    const labelStr = String(node.data?.label ?? '');
    const isActive =
      Boolean(activeEntityId) &&
      (node.id === activeEntityId ||
        labelStr.toLowerCase().includes(activeEntityId!.toLowerCase()) ||
        activeEntityId!.toLowerCase().includes(labelStr.toLowerCase()));

    return {
      ...node,
      style: {
        ...node.style,
        border: isActive ? '2px solid #38bdf8' : node.style?.border,
        boxShadow: isActive ? '0 0 15px rgba(56, 189, 248, 0.6)' : 'none',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.25s ease-in-out',
      },
    };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(styledNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync node styles when activeEntityId changes
  React.useEffect(() => {
    setNodes(styledNodes);
  }, [activeEntityId]);

  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex flex-col">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 z-10">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Knowledge Graph & Concept Mind Map</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            {nodes.length} entities · {edges.length} relations
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Multi-hop reasoning active
          </span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => {
            const lbl = node.data.label as string;
            setSelectedNode(lbl);
            if (onSelectEntity) {
              onSelectEntity(lbl, node.id);
            }
          }}
          fitView
        >
          <Background color="#27272a" gap={16} />
          <Controls className="bg-zinc-900 border-zinc-700 text-zinc-200" />
          <MiniMap className="bg-zinc-900 border-zinc-800" nodeColor="#3f3f46" />
        </ReactFlow>
      </div>

      {/* Citation Overlay Footer */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-zinc-900/95 border border-zinc-800 rounded-lg shadow-xl backdrop-blur flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <div>
              <span className="text-xs font-semibold text-zinc-300">Grounded Citation: </span>
              <span className="text-xs text-indigo-400 font-mono">[{selectedNode}]</span>
              <p className="text-xs text-zinc-400 mt-0.5">
                Referenced in Document "System Architecture Specification" (Page 1, Section 2.4).
              </p>
            </div>
          </div>
          <button className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition">
            View Source
          </button>
        </div>
      )}
    </div>
  );
}
