import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { X, Database, Clock, CheckCircle, XCircle, Loader, RefreshCw, ChevronDown } from 'lucide-react';
import { useLineage } from '../hooks/useLineage';

const Lineage = () => {
  const { 
    lineageData, 
    loading, 
    error, 
    loadLineage,
    pipelines = [],
    domains = [],
    loadingPipelines,
    loadPipelines
  } = useLineage();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showPipelineList, setShowPipelineList] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false); 
  const [selectedDomain, setSelectedDomain] = useState({ id: '__all__', name: '전체 도메인', region: 'ap-northeast-2' }); // 초기값 설정

  // -------------------------
  // 파이프라인에서 실제 사용되는 도메인 ID 추출
  // -------------------------
  const getActualDomainsFromPipelines = () => {
    const domainSet = new Set();
    
    pipelines.forEach(p => {
      if (p.tags && p.tags['sagemaker:domain-arn']) {
        const match = p.tags['sagemaker:domain-arn'].match(/domain\/(d-[a-z0-9]+)/);
        if (match) {
          domainSet.add(match[1]);
        }
      }
    });
    
    return Array.from(domainSet);
  };

  const actualDomainIds = getActualDomainsFromPipelines();

  // -------------------------
  // 각 도메인별 파이프라인 개수 계산
  // -------------------------
  const getDomainPipelineCount = (domainId) => {
    if (domainId === '__untagged__') {
      return pipelines.filter(p => {
        const hasDomainTag = p.tags && p.tags['sagemaker:domain-arn'];
        const hasMatchedDomain = p.matchedDomain;
        return !hasDomainTag && !hasMatchedDomain;
      }).length;
    }
    
    return pipelines.filter(p => {
      if (p.tags && p.tags['sagemaker:domain-arn']) {
        const domainArn = p.tags['sagemaker:domain-arn'];
        return domainArn.includes(domainId);
      }
      return false;
    }).length;
  };

  // -------------------------
  // 도메인으로 필터링된 파이프라인
  // -------------------------
  const filteredPipelines = selectedDomain 
    ? selectedDomain.id === '__all__'
      ? pipelines
      : selectedDomain.id === '__untagged__'
        ? pipelines.filter(p => {
            const hasDomainTag = p.tags && p.tags['sagemaker:domain-arn'];
            const hasMatchedDomain = p.matchedDomain;
            return !hasDomainTag && !hasMatchedDomain;
          })
        : pipelines.filter(p => {
            if (p.tags && p.tags['sagemaker:domain-arn']) {
              const domainArn = p.tags['sagemaker:domain-arn'];
              return domainArn.includes(selectedDomain.id);
            }
            if (p.matchedDomain) {
              return p.matchedDomain === selectedDomain.name;
            }
            return false;
          })
    : pipelines;

  // -------------------------
  // 안전 렌더링 헬퍼들
  // -------------------------
  const safeValue = (v) => {
    if (v == null) return 'N/A';
    if (typeof v === 'object') {
      if ('Get' in v && (typeof v.Get === 'string' || typeof v.Get === 'number' || typeof v.Get === 'boolean')) {
        return v.Get;
      }
      try {
        return JSON.stringify(v);
      } catch {
        return '[Object]';
      }
    }
    return String(v);
  };

  const formatDateSafe = (val) => {
    if (val == null) return 'N/A';
    const unwrapped = (typeof val === 'object' && 'Get' in val) ? val.Get : val;
    try {
      const d = new Date(unwrapped);
      if (isNaN(d)) return safeValue(unwrapped);
      return d.toLocaleString('ko-KR');
    } catch {
      return safeValue(unwrapped);
    }
  };

  // -------------------------
  // 노드 스타일 / status icon
  // -------------------------
  const getNodeStyle = (type, status) => {
    let background = '#f3f4f6';
    let border = '2px solid #9ca3af';

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

  const getStatusIcon = (status) => {
    const s = safeValue(status);
    if (s === 'Succeeded') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (s === 'Failed') return <XCircle className="w-4 h-4 text-red-600" />;
    if (s === 'Executing') return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
    return null;
  };

  // -------------------------
  // dagre layout
  // -------------------------
  const getLayoutedElements = (nodesArr, edgesArr) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: 'LR',
      nodesep: 50,
      ranksep: 100,
    });

    nodesArr.forEach((n) => {
      dagreGraph.setNode(n.id, { width: 180, height: 80 });
    });

    edgesArr.forEach((e) => {
      dagreGraph.setEdge(e.source, e.target, { minlen: 1 });
    });

    try {
      dagre.layout(dagreGraph);
    } catch (err) {
      console.warn('dagre.layout failed', err);
    }

    return nodesArr.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 };
      return {
        ...node,
        position: {
          x: (nodeWithPosition.x || 0) - 90,
          y: (nodeWithPosition.y || 0) - 40,
        },
      };
    });
  };

  // -------------------------
  // convert functions
  // -------------------------
  const convertToNodes = (graphData) => {
    if (!graphData || !graphData.nodes) return [];
    return graphData.nodes.map((node) => ({
      id: node.id,
      type: 'default',
      data: {
        label: (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="font-semibold text-sm">{safeValue(node.label) || node.id}</div>
              {node.run?.status && getStatusIcon(node.run.status)}
            </div>
            <div className="text-xs text-gray-500">{safeValue(node.type) || 'Step'}</div>
          </div>
        )
      },
      position: { x: 0, y: 0 },
      sourcePosition: 'right',
      targetPosition: 'left',
      style: getNodeStyle(node.type, node.run?.status),
    }));
  };

  const convertToEdges = (graphData) => {
    if (!graphData || !graphData.edges) return [];

    const edgesOut = [];
    const edgeSet = new Set();

    const getLabelString = (label) => {
      if (label == null) return '';
      if (typeof label === 'string') return label;
      if (typeof label === 'number') return String(label);
      if (typeof label === 'object') {
        if ('Get' in label) return safeValue(label.Get);
        try {
          return JSON.stringify(label);
        } catch {
          return '';
        }
      }
      return '';
    };

    graphData.edges.forEach((edge) => {
      const edgeId = `${edge.from}-${edge.to}`;
      if (!edgeSet.has(edgeId)) {
        edgesOut.push({
          id: `e${edgesOut.length}`,
          source: edge.from,
          target: edge.to,
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          type: 'smoothstep',
          label: getLabelString(edge.label),
          labelStyle: { fontSize: 10, fill: '#6b7280' },
        });
        edgeSet.add(edgeId);
      }
    });

    if (graphData.nodes) {
      graphData.nodes.forEach(targetNode => {
        if (!targetNode.inputs || targetNode.inputs.length === 0) return;

        targetNode.inputs.forEach(input => {
          if (input.name === 'code') return;

          graphData.nodes.forEach(sourceNode => {
            if (sourceNode.id === targetNode.id) return;
            if (!sourceNode.outputs || sourceNode.outputs.length === 0) return;

            const matchingOutput = sourceNode.outputs.find(output => output.uri === input.uri);

            if (matchingOutput) {
              const edgeId = `${sourceNode.id}-${targetNode.id}`;
              if (!edgeSet.has(edgeId)) {
                edgesOut.push({
                  id: `e${edgesOut.length}`,
                  source: sourceNode.id,
                  target: targetNode.id,
                  animated: true,
                  style: { stroke: '#10b981', strokeWidth: 2 },
                  type: 'smoothstep',
                  label: safeValue(input.name) || safeValue(matchingOutput.name) || '',
                  labelStyle: { fontSize: 9, fill: '#059669', fontWeight: 500 },
                });
                edgeSet.add(edgeId);
              }
            }
          });
        });
      });

      graphData.nodes.forEach(node => {
        if (node.type === 'Condition') {
          const lastNode = graphData.nodes
            .filter(n => n.type === 'Processing' || n.type === 'Training')
            .sort((a, b) => {
              const aTime = new Date(a.run?.endTime || 0);
              const bTime = new Date(b.run?.endTime || 0);
              return bTime - aTime;
            })[0];

          if (lastNode) {
            const edgeId = `${lastNode.id}-${node.id}`;
            if (!edgeSet.has(edgeId)) {
              edgesOut.push({
                id: `e${edgesOut.length}`,
                source: lastNode.id,
                target: node.id,
                animated: true,
                style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
                type: 'smoothstep',
                label: 'condition',
                labelStyle: { fontSize: 9, fill: '#f59e0b', fontWeight: 500 },
              });
              edgeSet.add(edgeId);
            }
          }
        }
      });
    }

    return edgesOut;
  };

  // -------------------------
  // pipeline 선택 시 lineage 로드
  // -------------------------
  const handlePipelineSelect = async (pipeline) => {
    setSelectedPipeline(pipeline);
    setShowPipelineList(false);

    try {
      const data = await loadLineage(pipeline.name, pipeline.region);
      if (data?.graph) {
        const convertedNodes = convertToNodes(data.graph);
        const convertedEdges = convertToEdges(data.graph);

        const filteredEdges = convertedEdges.filter(edge => !(edge.source === 'Preprocess' && edge.target === 'Evaluate'));

        const layoutedNodes = getLayoutedElements(convertedNodes, filteredEdges, data.graph);

        setNodes(layoutedNodes);
        setEdges(filteredEdges);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // initial pipelines load
  // -------------------------
  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  // -------------------------
  // node click - details + highlight
  // -------------------------
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id);

    const nodeDetail = lineageData?.graph?.nodes?.find(n => n.id === node.id);
    if (nodeDetail) {
      const nodeInputs = nodeDetail.inputs || [];
      const nodeOutputs = nodeDetail.outputs || [];

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

  // -------------------------
  // pane click - reset highlight
  // -------------------------
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

  // -------------------------
  // duration helper
  // -------------------------
  const formatDuration = (seconds) => {
    if (seconds == null || seconds === 'N/A') return 'N/A';
    if (typeof seconds === 'object' && 'Get' in seconds) {
      const val = seconds.Get;
      if (typeof val === 'number') seconds = val;
      else return safeValue(seconds);
    }
    const secsNum = Number(seconds);
    if (isNaN(secsNum)) return safeValue(seconds);
    const mins = Math.floor(secsNum / 60);
    const secs = secsNum % 60;
    return `${mins}분 ${secs}초`;
  };

  // -------------------------
  // render
  // -------------------------
  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">SageMaker Pipelines</h3>
          <button
            onClick={() => loadPipelines()}
            disabled={loadingPipelines}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPipelines ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {safeValue(error)}
          </div>
        )}

        {/* 도메인 선택 */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-gray-700">도메인 필터</label>
          <div className="relative">
            <button
              onClick={() => setShowDomainDropdown(!showDomainDropdown)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="text-gray-900">
                {selectedDomain 
                  ? `${safeValue(selectedDomain.name)} (${filteredPipelines.length}개)`
                  : '전체 도메인 (3개)'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDomainDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDomainDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* 전체 */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedDomain({ id: '__all__', name: '전체 도메인', region: 'ap-northeast-2' });
                      setShowDomainDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <div className="font-medium text-sm text-gray-900">전체 도메인 ({pipelines.length}개)</div>
                  </button>
                </div>

                {/* 파싱된 도메인 */}
                {domains.length > 0 && (
                  <div className="border-b border-gray-200">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                      파싱된 도메인 (Catalog)
                    </div>
                    {domains.map((domain, index) => {
                      const count = getDomainPipelineCount(domain.id);
                      return (
                        <button
                          key={`catalog-${index}`}
                          onClick={() => {
                            setSelectedDomain(domain);
                            setShowDomainDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          <div className="font-medium text-sm text-gray-900">{safeValue(domain.name)}</div>
                          <div className="text-xs text-gray-500">{count}개</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 파이프라인이 속한 도메인 */}
                {(() => {
                  const orphanDomains = actualDomainIds.filter(
                    domainId => !domains.find(d => d.id === domainId)
                  );
                  
                  if (orphanDomains.length > 0) {
                    return (
                      <div className="border-b border-gray-200">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                          파이프라인이 속한 도메인
                        </div>
                        {orphanDomains.map((domainId, index) => {
                          const count = getDomainPipelineCount(domainId);
                          return (
                            <button
                              key={`actual-${index}`}
                              onClick={() => {
                                const domain = { id: domainId, name: domainId, region: 'ap-northeast-2' };
                                setSelectedDomain(domain);
                                setShowDomainDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50"
                            >
                              <div className="font-medium text-sm text-gray-900">{domainId}</div>
                              <div className="text-xs text-gray-500">{count}개</div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  }
                })()}

                {/* 기타 */}
                {(() => {
                  const untaggedCount = getDomainPipelineCount('__untagged__');
                  if (untaggedCount > 0) {
                    return (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                          기타
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDomain({ id: '__untagged__', name: '도메인 미지정', region: 'ap-northeast-2' });
                            setShowDomainDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          <div className="font-medium text-sm text-gray-900">도메인 미지정</div>
                          <div className="text-xs text-gray-500">{untaggedCount}개</div>
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </div>

        {/* 파이프라인 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            파이프라인 선택 
            {selectedDomain && (
              <span className="text-xs text-gray-500 ml-2">
                ({filteredPipelines.length}개)
              </span>
            )}
          </label>
          {loadingPipelines ? (
            <div className="text-center py-4 text-gray-600">파이프라인 목록을 불러오는 중...</div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <span className="text-gray-900">
                  {selectedPipeline ? safeValue(selectedPipeline.name) : '-- 파이프라인을 선택하세요 --'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredPipelines.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      {selectedDomain ? '선택한 도메인에 파이프라인이 없습니다' : '파이프라인이 없습니다'}
                    </div>
                  ) : (
                    filteredPipelines.map((pipeline, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handlePipelineSelect(pipeline);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-900">{safeValue(pipeline.name)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {safeValue(pipeline.region)} - {formatDateSafe(pipeline.lastModifiedTime)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 선택된 도메인/파이프라인 정보 */}
        {(selectedDomain || selectedPipeline) && (
          <div className="mt-3 space-y-2">
            {selectedDomain && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm font-semibold text-purple-900">
                  Domain: {safeValue(selectedDomain.name)}
                </div>
                <div className="text-xs text-purple-700 mt-1">
                  {safeValue(selectedDomain.id)}
                </div>
              </div>
            )}
            {selectedPipeline && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-semibold text-blue-900">
                  Pipeline: {safeValue(selectedPipeline.name)}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Region: {safeValue(selectedPipeline.region)} | Last Modified: {formatDateSafe(selectedPipeline.lastModifiedTime)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 메인 다이어그램 */}
      {selectedPipeline && (
        <div className="flex gap-6">
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
                  <div className="text-gray-500">파이프라인을 선택하세요</div>
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
                      <p className="text-sm font-medium">{safeValue(selectedNodeData.id)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Type</label>
                      <p className="text-sm font-medium">{safeValue(selectedNodeData.type)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Status</label>
                      <p className="text-sm font-medium">{safeValue(selectedNodeData.status)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Job Name</label>
                      <p className="text-sm font-mono text-xs break-all">{safeValue(selectedNodeData.jobName)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Job ARN</label>
                      <p className="text-sm font-mono text-xs break-all">{safeValue(selectedNodeData.jobArn)}</p>
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
                          ? formatDateSafe(selectedNodeData.startTime)
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium text-xs">
                        {selectedNodeData.endTime !== 'N/A' 
                          ? formatDateSafe(selectedNodeData.endTime)
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{safeValue(formatDuration(selectedNodeData.elapsedSec))}</span>
                    </div>
                  </div>
                </div>

                {/* 메트릭 */}
                {selectedNodeData.metrics && Object.keys(selectedNodeData.metrics).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Metrics</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedNodeData.metrics).map(([key, value]) => (
                        <div key={key} className="p-2 bg-blue-50 rounded flex justify-between">
                          <span className="text-xs font-medium text-blue-700">{safeValue(key)}:</span>
                          <span className="text-xs font-bold text-blue-900">
                            {typeof value === 'number' ? value.toFixed(4) : safeValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inputs */}
                {selectedNodeData.inputs && selectedNodeData.inputs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Inputs</h4>
                    <div className="space-y-3">
                      {selectedNodeData.inputs.map((input, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="text-xs font-semibold text-green-900 mb-1">
                            {safeValue(input.name)}
                          </div>
                          <div className="text-xs font-mono text-green-700 break-all mb-2">
                            {safeValue(input.uri)}
                          </div>
                          {input.s3 && (
                            <div className="mt-2 pt-2 border-t border-green-200 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-green-600">Region:</span>
                                <span className="font-medium">{safeValue(input.s3.region)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-green-600">Encryption:</span>
                                <span className="font-medium">{safeValue(input.s3.encryption)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-green-600">Versioning:</span>
                                <span className="font-medium">{safeValue(input.s3.versioning)}</span>
                              </div>
                              {input.s3.tags && Object.keys(input.s3.tags).length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-green-700 mb-1">Tags:</div>
                                  {Object.entries(input.s3.tags).slice(0, 3).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-xs">
                                      <span className="text-green-600">{safeValue(k)}:</span>
                                      <span className="font-medium truncate ml-2">{safeValue(v)}</span>
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
                {selectedNodeData.outputs && selectedNodeData.outputs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Outputs</h4>
                    <div className="space-y-3">
                      {selectedNodeData.outputs.map((output, index) => (
                        <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded">
                          <div className="text-xs font-semibold text-purple-900 mb-1">
                            {safeValue(output.name)}
                          </div>
                          <div className="text-xs font-mono text-purple-700 break-all mb-2">
                            {safeValue(output.uri)}
                          </div>
                          {output.s3 && (
                            <div className="mt-2 pt-2 border-t border-purple-200 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-purple-600">Region:</span>
                                <span className="font-medium">{safeValue(output.s3.region)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-purple-600">Encryption:</span>
                                <span className="font-medium">{safeValue(output.s3.encryption)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-purple-600">Versioning:</span>
                                <span className="font-medium">{safeValue(output.s3.versioning)}</span>
                              </div>
                              {output.s3.tags && Object.keys(output.s3.tags).length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-purple-700 mb-1">Tags:</div>
                                  {Object.entries(output.s3.tags).slice(0, 3).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-xs">
                                      <span className="text-purple-600">{safeValue(k)}:</span>
                                      <span className="font-medium truncate ml-2">{safeValue(v)}</span>
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
      )}

      {/* 파이프라인 요약 */}
      {lineageData?.summary && selectedPipeline && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Overall Status</p>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon(lineageData.summary.overallStatus)}
              <p className="text-xl font-bold text-gray-900">{safeValue(lineageData.summary.overallStatus)}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Succeeded Steps</p>
            <p className="text-2xl font-bold text-green-600">{safeValue(lineageData.summary.nodeStatus?.Succeeded) || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Total Steps</p>
            <p className="text-2xl font-bold text-gray-900">{safeValue(nodes.length)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Total Duration</p>
            <p className="text-2xl font-bold text-gray-900">{safeValue(formatDuration(lineageData.summary.elapsedSec))}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lineage;