import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { X, Tag, Database, Calendar, MapPin, Shield, AlertTriangle, RefreshCw, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useLineage } from '../hooks/useLineage';

const Lineage = () => {
  const { lineageData, loading, error, loadLineage } = useLineage();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [pipelineName, setPipelineName] = useState('mlops-pipeline');

  // 노드 타입/상태에 따른 스타일
  const getNodeStyle = (type, status) => {
    let background = '#f3f4f6';
    let border = '2px solid #9ca3af';

    // 상태에 따른 색상
    if (status === 'Succeeded') {
      background = '#d1fae5';
      border = '2px solid #10b981';
    } else if (status === 'Failed') {
      background = '#fee2e2';
      border = '2px solid #ef4444';
    } else if (status === 'Executing') {
      background = '#dbeafe';
      border = '2px solid #3b82f6';
    }

    // 타입에 따른 추가 스타일
    if (type === 'Condition') {
      background = '#fef3c7';
      border = '2px solid #f59e0b';
    }

    return {
      background,
      border,
      borderRadius: '8px',
      padding: '12px',
      minWidth: '150px'
    };
  };

  // 상태 아이콘
  const getStatusIcon = (status) => {
    if (status === 'Succeeded') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'Failed') return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === 'Executing') return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
    return null;
  };

  // API 데이터를 ReactFlow 노드로 변환
  // dagre를 사용한 자동 레이아웃
  const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    // 그래프 설정: 왼쪽에서 오른쪽으로 배치
    dagreGraph.setGraph({ 
      rankdir: 'LR',  // Left to Right
      nodesep: 100,   // 노드 간 간격
      ranksep: 150,   // 레벨 간 간격
    });

    // 노드 추가
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 180, height: 80 });
    });

    // 엣지 추가
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // 레이아웃 계산
    dagre.layout(dagreGraph);

    // 계산된 위치를 노드에 적용
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 90,  // 중앙 정렬
          y: nodeWithPosition.y - 40,
        },
      };
    });

    return layoutedNodes;
  };

  // API 데이터를 ReactFlow 노드로 변환
  const convertToNodes = (graphData) => {
    if (!graphData || !graphData.nodes) return [];
    
    const nodes = graphData.nodes.map((node) => ({
      id: node.id,
      type: 'default',
      data: {
        label: (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="font-semibold text-sm">{node.label || node.id}</div>
              {node.run?.status && getStatusIcon(node.run.status)}
            </div>
            <div className="text-xs text-gray-500">{node.type || 'Step'}</div>
          </div>
        )
      },
      position: { x: 0, y: 0 },  // 초기 위치 (dagre가 계산함)
      sourcePosition: 'right',
      targetPosition: 'left',
      style: getNodeStyle(node.type, node.run?.status),
    }));

    return nodes;
  };

  // API 데이터를 ReactFlow 엣지로 변환
  const convertToEdges = (graphData) => {
    if (!graphData || !graphData.edges) return [];
    
    return graphData.edges.map((edge, index) => ({
      id: `e${index}`,
      source: edge.from,
      target: edge.to,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      type: 'smoothstep',
      label: '',
      labelStyle: { fontSize: 10, fill: '#6b7280' },
    }));
  };

  // 리니지 데이터 로드
  // 리니지 데이터 로드
  const loadLineageData = async () => {
    try {
      const data = await loadLineage(pipelineName);
      
      if (data?.graph) {
        const convertedNodes = convertToNodes(data.graph);
        const convertedEdges = convertToEdges(data.graph);
        
        // dagre 레이아웃 적용
        const layoutedNodes = getLayoutedElements(convertedNodes, convertedEdges);
        
        setNodes(layoutedNodes);
        setEdges(convertedEdges);
      }
    } catch (err) {
      // 에러는 이미 useLineage에서 처리됨
    }
  };

  // 컴포넌트 마운트 시 자동 로드
  useEffect(() => {
    loadLineageData();
  }, []);

  // 노드 클릭 핸들러
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id);

    // API 데이터에서 노드 상세 정보 찾기
    const nodeDetail = lineageData?.graph?.nodes?.find(n => n.id === node.id);
    
    if (nodeDetail) {
      // 해당 노드와 관련된 아티팩트 찾기
      const nodeInputs = nodeDetail.inputs || [];
      const nodeOutputs = nodeDetail.outputs || [];
      
      // 아티팩트 상세 정보 매칭
      const inputArtifacts = nodeInputs.map(input => {
        const artifact = lineageData?.graph?.artifacts?.find(a => a.uri === input.uri);
        return { ...input, s3: artifact?.s3 };
      });
      
      const outputArtifacts = nodeOutputs.map(output => {
        const artifact = lineageData?.graph?.artifacts?.find(a => a.uri === output.uri);
        return { ...output, s3: artifact?.s3 };
      });

      setSelectedNodeData({
        id: nodeDetail.id,
        type: nodeDetail.type || 'Unknown',
        label: nodeDetail.label || nodeDetail.id,
        status: nodeDetail.run?.status || 'Unknown',
        startTime: nodeDetail.run?.startTime || 'N/A',
        endTime: nodeDetail.run?.endTime || 'N/A',
        elapsedSec: nodeDetail.run?.elapsedSec || 'N/A',
        jobArn: nodeDetail.run?.jobArn || 'N/A',
        jobName: nodeDetail.run?.jobName || 'N/A',
        metrics: nodeDetail.run?.metrics || {},
        inputs: inputArtifacts,
        outputs: outputArtifacts,
      });
      setShowPanel(true);
    }

    // 연결된 노드 하이라이트 (기존 로직 유지)
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

    setEdges((eds) =>
      eds.map((edge) => {
        const isHighlighted = allConnectedNodes.has(edge.source) && allConnectedNodes.has(edge.target);
        return {
          ...edge,
          style: { 
            ...edge.style, 
            stroke: isHighlighted ? '#ef4444' : '#d1d5db', 
            strokeWidth: isHighlighted ? 3 : 1 
          },
          animated: isHighlighted,
        };
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
  }, [edges, setEdges, setNodes, lineageData]);

  // 배경 클릭 핸들러
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowPanel(false);

    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: { ...edge.style, stroke: '#6366f1', strokeWidth: 2 },
        animated: true,
      }))
    );

    setNodes((nds) =>
      nds.map((n) => {
        const originalStyle = getNodeStyle(
          lineageData?.graph?.nodes?.find(node => node.id === n.id)?.type,
          lineageData?.graph?.nodes?.find(node => node.id === n.id)?.run?.status
        );
        return {
          ...n,
          style: {
            ...originalStyle,
            boxShadow: 'none',
            opacity: 1,
          },
        };
      })
    );
  }, [setEdges, setNodes, lineageData]);

  // 시간 포맷팅
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 'N/A') return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              파이프라인 이름
            </label>
            <input
              type="text"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              placeholder="mlops-pipeline"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={loadLineageData}
            disabled={loading}
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '로딩 중...' : '조회'}
          </button>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {/* 파이프라인 정보 */}
        {lineageData?.pipeline && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-semibold text-blue-900 mb-1">
              {lineageData.pipeline.name}
            </div>
            <div className="text-xs text-blue-700">
              Last Modified: {new Date(lineageData.pipeline.lastModifiedTime).toLocaleString('ko-KR')}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* 메인 다이어그램 */}
        <div className={`bg-white rounded-lg shadow-sm border ${showPanel ? 'flex-1' : 'w-full'}`} style={{ height: '650px' }}>
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-600">데이터를 불러오는 중...</div>
              </div>
            ) : nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">파이프라인 이름을 입력하고 조회 버튼을 클릭하세요</div>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* 사이드 패널 */}
        {showPanel && selectedNodeData && (
          <div className="w-96 bg-white rounded-lg shadow-lg border overflow-hidden flex flex-col" style={{ height: '650px' }}>
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Step Details</h3>
                {getStatusIcon(selectedNodeData.status)}
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Basic Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Step ID</label>
                    <p className="text-sm font-medium">{selectedNodeData.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Type</label>
                    <p className="text-sm font-medium">{selectedNodeData.type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <p className="text-sm font-medium">{selectedNodeData.status}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Job Name</label>
                    <p className="text-sm font-mono text-xs break-all">{selectedNodeData.jobName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Job ARN</label>
                    <p className="text-sm font-mono text-xs break-all">{selectedNodeData.jobArn}</p>
                  </div>
                </div>
              </div>

              {/* 실행 정보 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Execution Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-medium text-xs">
                      {selectedNodeData.startTime !== 'N/A' 
                        ? new Date(selectedNodeData.startTime).toLocaleString('ko-KR')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Time:</span>
                    <span className="font-medium text-xs">
                      {selectedNodeData.endTime !== 'N/A' 
                        ? new Date(selectedNodeData.endTime).toLocaleString('ko-KR')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{formatDuration(selectedNodeData.elapsedSec)}</span>
                  </div>
                </div>
              </div>

              {/* 메트릭 */}
              {Object.keys(selectedNodeData.metrics).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Metrics</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedNodeData.metrics).map(([key, value]) => (
                      <div key={key} className="p-2 bg-blue-50 rounded flex justify-between">
                        <span className="text-xs font-medium text-blue-700">{key}:</span>
                        <span className="text-xs font-bold text-blue-900">
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inputs */}
              {selectedNodeData.inputs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Inputs</h4>
                  <div className="space-y-3">
                    {selectedNodeData.inputs.map((input, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="text-xs font-semibold text-green-900 mb-1">
                          {input.name}
                        </div>
                        <div className="text-xs font-mono text-green-700 break-all mb-2">
                          {input.uri}
                        </div>
                        {input.s3 && (
                          <div className="mt-2 pt-2 border-t border-green-200 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-600">Region:</span>
                              <span className="font-medium">{input.s3.region}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-600">Encryption:</span>
                              <span className="font-medium">{input.s3.encryption}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-600">Versioning:</span>
                              <span className="font-medium">{input.s3.versioning}</span>
                            </div>
                            {input.s3.tags && Object.keys(input.s3.tags).length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-medium text-green-700 mb-1">Tags:</div>
                                {Object.entries(input.s3.tags).slice(0, 3).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-xs">
                                    <span className="text-green-600">{key}:</span>
                                    <span className="font-medium truncate ml-2">{value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outputs */}
              {selectedNodeData.outputs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Outputs</h4>
                  <div className="space-y-3">
                    {selectedNodeData.outputs.map((output, index) => (
                      <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <div className="text-xs font-semibold text-purple-900 mb-1">
                          {output.name}
                        </div>
                        <div className="text-xs font-mono text-purple-700 break-all mb-2">
                          {output.uri}
                        </div>
                        {output.s3 && (
                          <div className="mt-2 pt-2 border-t border-purple-200 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-purple-600">Region:</span>
                              <span className="font-medium">{output.s3.region}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-purple-600">Encryption:</span>
                              <span className="font-medium">{output.s3.encryption}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-purple-600">Versioning:</span>
                              <span className="font-medium">{output.s3.versioning}</span>
                            </div>
                            {output.s3.tags && Object.keys(output.s3.tags).length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-medium text-purple-700 mb-1">Tags:</div>
                                {Object.entries(output.s3.tags).slice(0, 3).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-xs">
                                    <span className="text-purple-600">{key}:</span>
                                    <span className="font-medium truncate ml-2">{value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 파이프라인 요약 */}
      {lineageData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Overall Status</p>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon(lineageData.summary.overallStatus)}
              <p className="text-xl font-bold text-gray-900">{lineageData.summary.overallStatus}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Succeeded Steps</p>
            <p className="text-2xl font-bold text-green-600">{lineageData.summary.nodeStatus?.Succeeded || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Total Steps</p>
            <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Total Duration</p>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(lineageData.summary.elapsedSec)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lineage;