import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, Tag, Database, Calendar, MapPin, Shield, AlertTriangle } from 'lucide-react';

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
  const [showPanel, setShowPanel] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState(null);

  // 노드 타입별 메타데이터 생성
  const getNodeMetadata = (nodeId) => {
    const metadataMap = {
      's3-raw-data': {
        type: 'S3 Bucket',
        arn: 'arn:aws:s3:::raw-data-bucket',
        region: 'ap-northeast-2',
        created: '2024-03-15',
        size: '2.3 TB',
        encryption: 'AES-256',
        publicAccess: 'Blocked',
        versioning: 'Enabled',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'DataClassification', value: 'Confidential' },
          { key: 'Owner', value: 'data-team' }
        ],
        securityIssues: [],
        lastScanned: '2025-01-26 14:30:00'
      },
      's3-customer-data': {
        type: 'S3 Bucket',
        arn: 'arn:aws:s3:::customer-data',
        region: 'ap-northeast-2',
        created: '2024-01-10',
        size: '5.7 TB',
        encryption: 'AES-256',
        publicAccess: 'Blocked',
        versioning: 'Enabled',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'DataClassification', value: 'PII' },
          { key: 'Compliance', value: 'GDPR' }
        ],
        securityIssues: [
          { severity: 'Medium', message: 'Bucket policy allows overly broad access' }
        ],
        lastScanned: '2025-01-26 14:30:00'
      },
      's3-logs': {
        type: 'S3 Bucket',
        arn: 'arn:aws:s3:::application-logs',
        region: 'ap-northeast-2',
        created: '2024-02-20',
        size: '890 GB',
        encryption: 'SSE-S3',
        publicAccess: 'Blocked',
        versioning: 'Disabled',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'DataClassification', value: 'Internal' },
          { key: 'RetentionPolicy', value: '90days' }
        ],
        securityIssues: [],
        lastScanned: '2025-01-26 14:30:00'
      },
      'lambda-etl': {
        type: 'Lambda Function',
        arn: 'arn:aws:lambda:ap-northeast-2:123456789012:function:data-etl-processor',
        region: 'ap-northeast-2',
        runtime: 'Python 3.11',
        memory: '1024 MB',
        timeout: '15 minutes',
        lastModified: '2025-01-20',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'Team', value: 'data-engineering' },
          { key: 'Purpose', value: 'ETL' }
        ],
        securityIssues: [],
        lastScanned: '2025-01-26 14:30:00'
      },
      'lambda-transform': {
        type: 'Lambda Function',
        arn: 'arn:aws:lambda:ap-northeast-2:123456789012:function:data-transformer',
        region: 'ap-northeast-2',
        runtime: 'Node.js 18.x',
        memory: '512 MB',
        timeout: '5 minutes',
        lastModified: '2025-01-18',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'Team', value: 'data-engineering' }
        ],
        securityIssues: [],
        lastScanned: '2025-01-26 14:30:00'
      },
      'rds-main': {
        type: 'RDS PostgreSQL',
        arn: 'arn:aws:rds:ap-northeast-2:123456789012:db:main-database',
        region: 'ap-northeast-2',
        engine: 'PostgreSQL 15.3',
        instanceClass: 'db.r6g.xlarge',
        storage: '500 GB',
        multiAZ: 'Yes',
        encryption: 'Enabled',
        publicAccess: 'No',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'DataClassification', value: 'Sensitive' },
          { key: 'BackupRetention', value: '30days' }
        ],
        securityIssues: [],
        lastScanned: '2025-01-26 14:30:00'
      },
      'dynamo-cache': {
        type: 'DynamoDB Table',
        arn: 'arn:aws:dynamodb:ap-northeast-2:123456789012:table/user-cache',
        region: 'ap-northeast-2',
        billingMode: 'On-Demand',
        encryption: 'AWS Managed',
        pointInTimeRecovery: 'Enabled',
        itemCount: '1,250,000',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'Purpose', value: 'Caching' }
        ],
        securityIssues: [],
        lastScanned: '2025-01-26 14:30:00'
      },
      'api-gateway': {
        type: 'API Gateway',
        arn: 'arn:aws:apigateway:ap-northeast-2::/restapis/abc123xyz',
        region: 'ap-northeast-2',
        protocol: 'REST',
        stage: 'prod',
        authentication: 'IAM',
        throttling: '10000 req/sec',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'Public', value: 'Yes' }
        ],
        securityIssues: [
          { severity: 'Low', message: 'WAF not configured' }
        ],
        lastScanned: '2025-01-26 14:30:00'
      },
      'redshift': {
        type: 'Redshift Cluster',
        arn: 'arn:aws:redshift:ap-northeast-2:123456789012:cluster:analytics-warehouse',
        region: 'ap-northeast-2',
        nodeType: 'ra3.4xlarge',
        nodes: '4',
        storage: '8 TB',
        encryption: 'Enabled',
        publicAccess: 'No',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'Purpose', value: 'Analytics' },
          { key: 'CostCenter', value: 'BI-Team' }
        ],
        securityIssues: [],
        lastScanned: '2025-01-26 14:30:00'
      }
    };

    return metadataMap[nodeId] || null;
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id);

    // 노드 메타데이터 설정
    const metadata = getNodeMetadata(node.id);
    setSelectedNodeData(metadata);
    setShowPanel(true);

    // 재귀적으로 연결된 노드 찾기
    const findDownstreamNodes = (startNodeId, visited = new Set()) => {
      if (visited.has(startNodeId)) return visited;
      visited.add(startNodeId);

      edges.forEach(edge => {
        if (edge.source === startNodeId && !visited.has(edge.target)) {
          findDownstreamNodes(edge.target, visited);
        }
      });

      return visited;
    };

    const findUpstreamNodes = (startNodeId, visited = new Set()) => {
      if (visited.has(startNodeId)) return visited;
      visited.add(startNodeId);

      edges.forEach(edge => {
        if (edge.target === startNodeId && !visited.has(edge.source)) {
          findUpstreamNodes(edge.source, visited);
        }
      });

      return visited;
    };

    const downstreamNodes = findDownstreamNodes(node.id);
    const upstreamNodes = findUpstreamNodes(node.id);
    const allConnectedNodes = new Set([...downstreamNodes, ...upstreamNodes]);
    
    const highlightedEdges = edges.filter(edge => 
      allConnectedNodes.has(edge.source) && allConnectedNodes.has(edge.target)
    ).map(edge => edge.id);

    setEdges((eds) =>
      eds.map((edge) => {
        if (highlightedEdges.includes(edge.id)) {
          return {
            ...edge,
            style: { ...edge.style, stroke: '#ef4444', strokeWidth: 3 },
            animated: true,
          };
        } else {
          return {
            ...edge,
            style: { ...edge.style, stroke: '#d1d5db', strokeWidth: 1 },
            animated: false,
          };
        }
      })
    );

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            style: {
              ...n.style,
              border: '3px solid #ef4444',
              boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
              opacity: 1,
            },
          };
        } else if (allConnectedNodes.has(n.id)) {
          return {
            ...n,
            style: {
              ...n.style,
              border: '2px solid #ef4444',
              opacity: 1,
            },
          };
        } else {
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
    setShowPanel(false);

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
      <div className="flex gap-6">
        {/* 메인 다이어그램 */}
        <div className={`bg-white rounded-lg shadow-sm border  ${showPanel ? 'flex-1' : 'w-full'}`} style={{ height: '650px' }}>
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Data Flow Lineage</h3>
            <p className="text-sm text-gray-600">
              {selectedNode 
                ? 'Click on background to reset | Click node for details' 
                : 'Click on a node to highlight its connections and view details'
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

        {/* 사이드 패널 */}
        {showPanel && selectedNodeData && (
          <div className="w-96 bg-white rounded-lg shadow-lg border overflow-hidden flex flex-col" style={{ height: '650px' }}>
            {/* 헤더 */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Resource Details</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 내용 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Basic Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Type</label>
                    <p className="text-sm font-medium">{selectedNodeData.type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">ARN</label>
                    <p className="text-sm font-mono text-xs break-all">{selectedNodeData.arn}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedNodeData.region}</span>
                  </div>
                </div>
              </div>

              {/* 메타데이터 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Metadata</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(selectedNodeData)
                    .filter(([key]) => !['type', 'arn', 'region', 'tags', 'securityIssues', 'lastScanned'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* 태그 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </h4>
                <div className="space-y-2">
                  {selectedNodeData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs font-medium text-gray-600">{tag.key}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{tag.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 보안 이슈 */}
              {selectedNodeData.securityIssues.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-orange-500" />
                    Security Issues
                  </h4>
                  <div className="space-y-2">
                    {selectedNodeData.securityIssues.map((issue, index) => (
                      <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 mr-2" />
                          <div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              issue.severity === 'High' ? 'bg-red-100 text-red-700' :
                              issue.severity === 'Medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {issue.severity}
                            </span>
                            <p className="text-sm mt-1">{issue.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 마지막 스캔 시간 */}
              <div className="pt-4 border-t">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Last scanned: {selectedNodeData.lastScanned}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 범례 */}
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

      {/* 통계 */}
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