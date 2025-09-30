import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// initialNodes를 컴포넌트 밖에 먼저 정의
const initialNodes = [
  // S3 Buckets (Source)
  {
    id: 's3-raw-data',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">raw-data-bucket</div>
          <div className="text-xs text-gray-500">S3 Bucket</div>
        </div>
      )
    },
    position: { x: 50, y: 50 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#e8f5e9', 
      border: '2px solid #0B5629', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '150px'
    }
  },
  {
    id: 's3-customer-data',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">customer-data</div>
          <div className="text-xs text-gray-500">S3 Bucket</div>
        </div>
      )
    },
    position: { x: 50, y: 180 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#e8f5e9', 
      border: '2px solid #0B5629', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '150px'
    }
  },
  {
    id: 's3-logs',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">application-logs</div>
          <div className="text-xs text-gray-500">S3 Bucket</div>
        </div>
      )
    },
    position: { x: 50, y: 310 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#e8f5e9', 
      border: '2px solid #0B5629', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '150px'
    }
  },

  // Lambda Functions (Transform)
  {
    id: 'lambda-etl',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">data-etl-processor</div>
          <div className="text-xs text-gray-500">Lambda Function</div>
        </div>
      )
    },
    position: { x: 300, y: 100 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#fff3e0', 
      border: '2px solid #f57c00', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '160px'
    }
  },
  {
    id: 'lambda-transform',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">data-transformer</div>
          <div className="text-xs text-gray-500">Lambda Function</div>
        </div>
      )
    },
    position: { x: 300, y: 260 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#fff3e0', 
      border: '2px solid #f57c00', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '160px'
    }
  },

  // RDS Database (Storage)
  {
    id: 'rds-main',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">main-database</div>
          <div className="text-xs text-gray-500">RDS PostgreSQL</div>
        </div>
      )
    },
    position: { x: 570, y: 180 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#e3f2fd', 
      border: '2px solid #1976d2', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '150px'
    }
  },

  // DynamoDB (NoSQL)
  {
    id: 'dynamo-cache',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">user-cache</div>
          <div className="text-xs text-gray-500">DynamoDB</div>
        </div>
      )
    },
    position: { x: 570, y: 60 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#f3e5f5', 
      border: '2px solid #7b1fa2', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '150px'
    }
  },

  // API Gateway (Output)
  {
    id: 'api-gateway',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">public-api</div>
          <div className="text-xs text-gray-500">API Gateway</div>
        </div>
      )
    },
    position: { x: 820, y: 120 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#fce4ec', 
      border: '2px solid #c2185b', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '140px'
    }
  },

  // Analytics (Output)
  {
    id: 'redshift',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-semibold text-sm">analytics-warehouse</div>
          <div className="text-xs text-gray-500">Redshift</div>
        </div>
      )
    },
    position: { x: 820, y: 240 },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: { 
      background: '#fff9c4', 
      border: '2px solid #f57f17', 
      borderRadius: '8px', 
      padding: '12px',
      minWidth: '170px'
    }
  },
];

const initialEdges = [
  { 
    id: 'e1', 
    source: 's3-raw-data', 
    target: 'lambda-etl', 
    animated: true, 
    style: { stroke: '#0B5629', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e2', 
    source: 's3-customer-data', 
    target: 'lambda-etl', 
    animated: true, 
    style: { stroke: '#0B5629', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e3', 
    source: 's3-logs', 
    target: 'lambda-transform', 
    animated: true, 
    style: { stroke: '#0B5629', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e4', 
    source: 'lambda-etl', 
    target: 'rds-main', 
    animated: true, 
    style: { stroke: '#f57c00', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e5', 
    source: 'lambda-etl', 
    target: 'dynamo-cache', 
    animated: true, 
    style: { stroke: '#f57c00', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e6', 
    source: 'lambda-transform', 
    target: 'rds-main', 
    animated: true, 
    style: { stroke: '#f57c00', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e7', 
    source: 'rds-main', 
    target: 'api-gateway', 
    animated: true, 
    style: { stroke: '#1976d2', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e8', 
    source: 'rds-main', 
    target: 'redshift', 
    animated: true, 
    style: { stroke: '#1976d2', strokeWidth: 2 },
    type: 'smoothstep'
  },
  { 
    id: 'e9', 
    source: 'dynamo-cache', 
    target: 'api-gateway', 
    animated: true, 
    style: { stroke: '#7b1fa2', strokeWidth: 2 },
    type: 'smoothstep'
  },
];

const Lineage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback((event, node) => {
  setSelectedNode(node.id);

  // 1차 연결된 노드 찾기
  const directlyConnectedNodes = new Set();
  edges.forEach(edge => {
    if (edge.source === node.id) {
      directlyConnectedNodes.add(edge.target);
    }
    if (edge.target === node.id) {
      directlyConnectedNodes.add(edge.source);
    }
  });

  // 선택된 노드와 연결된 엣지 찾기
  const connectedEdgeIds = edges
    .filter(edge => edge.source === node.id || edge.target === node.id)
    .map(edge => edge.id);

  // 연결된 노드들 간의 엣지도 찾기
  const relatedEdgeIds = edges
    .filter(edge => 
      directlyConnectedNodes.has(edge.source) && directlyConnectedNodes.has(edge.target)
    )
    .map(edge => edge.id);

  // 모든 관련 엣지 합치기
  const allHighlightedEdges = new Set([...connectedEdgeIds, ...relatedEdgeIds]);

  // 엣지 색상 변경
  setEdges((eds) =>
    eds.map((edge) => {
      if (allHighlightedEdges.has(edge.id)) {
        // 선택된 노드와 관련된 모든 엣지 - 강조 색상
        return {
          ...edge,
          style: { ...edge.style, stroke: '#ef4444', strokeWidth: 3 },
          animated: true,
        };
      } else {
        // 다른 엣지 - 흐리게
        return {
          ...edge,
          style: { ...edge.style, stroke: '#d1d5db', strokeWidth: 1 },
          animated: false,
        };
      }
    })
  );

  // 노드 강조
  setNodes((nds) =>
    nds.map((n) => {
      if (n.id === node.id) {
        // 선택된 노드 - 테두리 강조
        return {
          ...n,
          style: {
            ...n.style,
            border: '3px solid #ef4444',
            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
            opacity: 1,
          },
        };
      } else if (directlyConnectedNodes.has(n.id)) {
        // 직접 연결된 노드 - 약간 강조
        return {
          ...n,
          style: {
            ...n.style,
            border: '2px solid #ef4444',
            opacity: 1,
          },
        };
      } else {
        // 다른 노드 - 흐리게
        return {
          ...n,
          style: {
            ...n.style,
            opacity: 0.3,
          },
        };
      }
    })
  );
}, [edges, setEdges, setNodes]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);

    setEdges((eds) =>
      eds.map((edge) => {
        let originalColor = '#0B5629';
        if (edge.id === 'e4' || edge.id === 'e5' || edge.id === 'e6') {
          originalColor = '#f57c00';
        } else if (edge.id === 'e7' || edge.id === 'e8') {
          originalColor = '#1976d2';
        } else if (edge.id === 'e9') {
          originalColor = '#7b1fa2';
        }

        return {
          ...edge,
          style: { ...edge.style, stroke: originalColor, strokeWidth: 2 },
          animated: true,
        };
      })
    );

    setNodes((nds) =>
      nds.map((n) => {
        let originalBorder = '2px solid #0B5629';
        if (n.id.includes('lambda')) {
          originalBorder = '2px solid #f57c00';
        } else if (n.id === 'rds-main') {
          originalBorder = '2px solid #1976d2';
        } else if (n.id === 'dynamo-cache') {
          originalBorder = '2px solid #7b1fa2';
        } else if (n.id === 'api-gateway') {
          originalBorder = '2px solid #c2185b';
        } else if (n.id === 'redshift') {
          originalBorder = '2px solid #f57f17';
        }

        return {
          ...n,
          style: {
            ...n.style,
            border: originalBorder,
            boxShadow: 'none',
            opacity: 1,
          },
        };
      })
    );
  }, [setEdges, setNodes]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border" style={{ height: '650px' }}>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Data Flow Lineage</h3>
          <p className="text-sm text-gray-600">
            {selectedNode 
              ? 'Click on background to reset | Selected node and connections are highlighted' 
              : 'Click on a node to highlight its connections'
            }
          </p>
        </div>
        <div style={{ height: 'calc(100% - 80px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            attributionPosition="bottom-left"
            connectionLineType="smoothstep"
            defaultEdgeOptions={{
              type: 'smoothstep',
            }}
          >
            <Controls />
            <Background variant="dots" gap={16} size={1} color="#d1d5db" />
          </ReactFlow>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h4 className="font-semibold mb-4">Resource Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-700 rounded"></div>
            <span className="text-sm">S3 Bucket</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-700 rounded"></div>
            <span className="text-sm">Lambda</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-700 rounded"></div>
            <span className="text-sm">RDS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 border-2 border-purple-700 rounded"></div>
            <span className="text-sm">DynamoDB</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-100 border-2 border-pink-700 rounded"></div>
            <span className="text-sm">API Gateway</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-700 rounded"></div>
            <span className="text-sm">Redshift</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600">Total Resources</p>
          <p className="text-2xl font-bold text-gray-900">9</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600">Data Flows</p>
          <p className="text-2xl font-bold text-gray-900">9</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600">Service Types</p>
          <p className="text-2xl font-bold text-gray-900">6</p>
        </div>
      </div>
    </div>
  );
};

export default Lineage;