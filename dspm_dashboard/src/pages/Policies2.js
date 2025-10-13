// src/components/Policies2.js
import React, { useState, useEffect } from 'react';
import { ClipboardList , ChevronRight, CheckCircle, XCircle, AlertCircle, Play, X, ChevronDown, ChevronUp } from 'lucide-react';
import gdprLogo from './logo/gdpr.png';
import ismspLogo from './logo/ismsp.png';
import iso27001Logo from './logo/iso27001.png';
import iso27017Logo from './logo/iso27017.png';
import nistairmflogo from './logo/nistairmf.png';
import euaiactlogo from './logo/euaiact.png';
import iso27701Logo from './logo/iso27701.png';
import iso42001Logo from './logo/iso42001.png';
import soc2Logo from './logo/soc2.png';
import pipaLogo from './logo/pipa.png';


const API_BASE = 'http://192.168.0.10:8003';
const AUDIT_API_BASE = 'http://192.168.0.10:8103';

const Policies2 = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [mappingDetail, setMappingDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [auditResults, setAuditResults] = useState({});
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState({ total: 0, executed: 0 });

  const frameworkLogos = {
    GDPR: gdprLogo,
    'ISMS-P': ismspLogo,
    'ISO-27001': iso27001Logo,
    'iso-27001': iso27001Logo,
    'ISO-27017': iso27017Logo,
    'iso-27017': iso27017Logo,
    'iso-27701' : iso27701Logo,
    'ISO-27701' : iso27701Logo,
    'iso-42001': iso42001Logo,
    'ISO-42001': iso42001Logo,
    'eu-ai-act': euaiactlogo,
    'EU-AI-Act': euaiactlogo,
    'nist-ai-rmf': nistairmflogo,
    'NIST-AI-RMF': nistairmflogo,
    'soc2' : soc2Logo,
    'SOC2' : soc2Logo,
    'pipa' : pipaLogo,
    'PIPA' : pipaLogo,   
    '개인정보보호법' : pipaLogo,  
    default: null,
  };

  const getFrameworkLogo = (frameworkName) => frameworkLogos[frameworkName] || frameworkLogos.default;

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/compliance/stats`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setFrameworks(data);
    } catch (err) {
      console.error('프레임워크 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async (frameworkCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/compliance/${frameworkCode}/requirements`);
      const data = await response.json();
      setRequirements(data);
      setSelectedFramework(frameworkCode);
      setSidePanelOpen(false);
      setMappingDetail(null);
      setAuditResults({});
      setExpandedItems({});
    } catch (err) {
      console.error('요구사항 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMappingDetail = async (frameworkCode, reqId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/compliance/${frameworkCode}/requirements/${reqId}/mappings`);
      const data = await response.json();
      setMappingDetail(data);
      setSidePanelOpen(true);
    } catch (err) {
      console.error('매핑 상세 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const auditRequirement = async (frameworkCode, reqId) => {
    setAuditing(true);
    try {
      const response = await fetch(`${AUDIT_API_BASE}/audit/${frameworkCode}/${reqId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Audit failed: ${response.status}`);
      const auditData = await response.json();

      setAuditResults((prev) => ({
        ...prev,
        [reqId]: auditData,
      }));

      setRequirements((prev) =>
        prev.map((req) =>
          req.id === reqId
            ? {
                ...req,
                mapping_status: auditData.requirement_status || 'Audited',
                audit_result: auditData,
              }
            : req
        )
      );

      alert('진단이 완료되었습니다.');
    } catch (err) {
      console.error('진단 실패:', err);
      alert('진단 실패했습니다: ' + err.message);
    } finally {
      setAuditing(false);
    }
  };

  const auditAllFramework = async (frameworkCode) => {
    if (!window.confirm(`${frameworkCode} 전체 항목에 대한 진단을 수행하시겠습니까?`)) return;

    setAuditing(true);
    setStreaming(true);
    setProgress({ total: 0, executed: 0 });

    try {
      // 스트리밍 시도
      const res = await fetch(`${AUDIT_API_BASE}/audit/${frameworkCode}/_all?stream=true`, {
        method: 'POST',
        headers: { Accept: 'application/x-ndjson' },
      });

      if (!res.ok) throw new Error(`Audit failed: ${res.status}`);

      const ctype = res.headers.get('content-type') || '';
      const isStream = ctype.includes('application/x-ndjson') && !!res.body?.getReader;

      // 스트리밍 불가 → 배치로 폴백
      if (!isStream) {
        const allAuditData = await res.json();
        const newAuditResults = {};
        const updatedRequirements = requirements.map((req) => {
          const reqResult = allAuditData.results?.find((r) => r.requirement_id === req.id);
          if (reqResult) {
            newAuditResults[req.id] = reqResult;
            return {
              ...req,
              mapping_status: reqResult.requirement_status || 'Audited',
              audit_result: reqResult,
            };
          }
          return req;
        });
        setAuditResults((prev) => ({ ...prev, ...newAuditResults }));
        setRequirements(updatedRequirements);
        alert('전체 진단이 완료되었습니다.');
        return;
      }

      // NDJSON 스트리밍 처리
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let executed = 0;
      let total = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });

        let nl;
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;

          let evt;
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }

          if (evt.type === 'meta') {
            total = evt.total || 0;
            setProgress({ total, executed });
          } else if (evt.type === 'requirement') {
            executed += 1;
            setProgress({ total, executed });

            // 해당 요구사항 행 갱신
            setRequirements((prev) =>
              prev.map((r) =>
                r.id === evt.requirement_id
                  ? { ...r, mapping_status: evt.requirement_status, audit_result: evt }
                  : r
              )
            );
            setAuditResults((prev) => ({ ...prev, [evt.requirement_id]: evt }));
          } else if (evt.type === 'summary') {
            // 옵션: 전체 요약 처리 필요 시 이곳에서 핸들링
          }
        }
      }

      alert('전체 진단이 완료되었습니다.');
    } catch (err) {
      console.error('전체 진단 실패:', err);
      alert('전체 진단에 실패했습니다: ' + err.message);
    } finally {
      setStreaming(false);
      setAuditing(false);
    }
  };

  const getMappingStatusBadge = (status) => {
    if (status === 'COMPLIANT' || status === 'Compliant') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-blue-800">
          준수
        </span>
      );
    }
    if (status === 'NON_COMPLIANT' || status === 'Non-Compliant') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          미준수
        </span>
      );
    }
    if (status === 'SKIPPED' || status === 'Skipped') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          건너뜀
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        -
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === 'COMPLIANT') return <CheckCircle className="w-4 h-4 text-blue-600" />;
    if (status === 'NON_COMPLIANT') return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === 'SKIPPED') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (status === 'ERROR') return <XCircle className="w-4 h-4 text-red-600" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const toggleExpand = (mappingCode) => {
    setExpandedItems((prev) => ({
      ...prev,
      [mappingCode]: !prev[mappingCode],
    }));
  };

  const closeSidePanel = () => {
    setSidePanelOpen(false);
    setMappingDetail(null);
    setExpandedItems({});
  };

  return (
    <div className="relative">
      <style>{`
        .requirements-table .id-column { display: none; }
      `}</style>

      <div className="flex items-center gap-3">
        <ClipboardList  className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-900">Compliance Policies</h1>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 py-4 px-2 ">
        <button
          onClick={() => {
            setSelectedFramework(null);
            setRequirements([]);
            closeSidePanel();
          }}
          className="hover:text-blue-600"
        >
          Frameworks
        </button>
        {selectedFramework && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{selectedFramework}</span>
          </>
        )}
      </div>

      {loading && !sidePanelOpen && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">에러: {error}</p>
        </div>
      )}

      {!selectedFramework && !loading && (
        <>
          {frameworks.length === 0 && !error ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <ClipboardList  className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">프레임워크 데이터가 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">API 연결 상태를 확인하세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {frameworks.map((fw) => (
                <div
                  key={fw.framework}
                  onClick={() => fetchRequirements(fw.framework)}
                  className="bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={getFrameworkLogo(fw.framework)}
                          alt={`${fw.framework} logo`}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <ClipboardList  className="w-6 h-6 text-blue-600" style={{ display: 'none' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{fw.framework}</h3>
                        <p className="text-sm text-gray-500">Compliance Framework</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-gray-900">{fw.count}</span>
                    <span className="text-sm text-gray-500">Requirements</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedFramework && !loading && (
        <div className={`bg-white rounded-lg shadow-sm border transition-all ${sidePanelOpen ? 'mr-[50%]' : ''}`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedFramework} Requirements</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{requirements.length} 항목</span>
                <div className="flex items-center gap-3">
                  {streaming && (
                    <span className="text-xs text-gray-500">
                      진행 {progress.executed}/{progress.total}
                    </span>
                  )}
                  <button
                    onClick={() => auditAllFramework(selectedFramework)}
                    disabled={auditing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    {auditing ? '진단 중...' : '전체 진단'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full requirements-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                  <th className="id-column px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">항목 코드</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">세부 사항</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매핑 상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {requirements.map((req) => (
                  <React.Fragment key={req.id}>
                    <tr className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.audit_result && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(`req-${req.id}`);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedItems[`req-${req.id}`] ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="id-column px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.item_code || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span>{req.regulation || req.title || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getMappingStatusBadge(req.mapping_status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-8">
                          <button
                            onClick={() => fetchMappingDetail(selectedFramework, req.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            상세보기
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              auditRequirement(selectedFramework, req.id);
                            }}
                            disabled={auditing}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            <Play className="w-3 h-3" />
                            진단
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedItems[`req-${req.id}`] && req.audit_result && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-700">진단 결과 상세</h4>
                              {req.audit_result.summary && (
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-blue-600">준수: {req.audit_result.summary.COMPLIANT || 0}</span>
                                  <span className="text-red-600">미준수: {req.audit_result.summary.NON_COMPLIANT || 0}</span>
                                  <span className="text-gray-500">건너뜀: {req.audit_result.summary.SKIPPED || 0}</span>
                                </div>
                              )}
                            </div>

                            {req.audit_result.results && req.audit_result.results.length > 0 ? (
                              <div className="space-y-3">
                                {req.audit_result.results.map((result, idx) => (
                                  <div key={idx} className="bg-white rounded border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-700">{result.mapping_code}</span>
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(result.status)}
                                        <span className="text-xs font-medium">{result.status}</span>
                                      </div>
                                    </div>

                                    {result.evaluations && result.evaluations.length > 0 && (
                                      <div className="p-3 space-y-2">
                                        {result.evaluations.map((evaluation, evalIdx) => (
                                          <div key={evalIdx} className="text-xs space-y-1">
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <div className="font-medium text-gray-700">{evaluation.service}</div>
                                                {evaluation.resource_id && (
                                                  <div className="text-gray-600">리소스: {evaluation.resource_id}</div>
                                                )}
                                                <div className="text-gray-500 mt-1">{evaluation.decision}</div>
                                              </div>
                                              {getStatusIcon(evaluation.status)}
                                            </div>

                                            {evaluation.extra?.error && (
                                              <div className="text-red-600 text-xs mt-1 p-2 bg-red-50 rounded">
                                                {evaluation.extra.error}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {result.reason && (
                                      <div className="px-4 py-2 bg-yellow-50 text-xs text-yellow-800">{result.reason}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">진단 결과가 없습니다.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sidePanelOpen && mappingDetail && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={closeSidePanel}></div>

          <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{mappingDetail.requirement.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>ID: {mappingDetail.requirement.id}</span>
                  <span>코드: {mappingDetail.requirement.item_code}</span>
                </div>
              </div>
              <button onClick={closeSidePanel} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">매핑 정보 ({mappingDetail.mappings.length}건)</h3>

              <div className="space-y-6">
                {mappingDetail.mappings.map((mapping, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">기본 정보</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-xs text-gray-500">코드</dt>
                            <dd className="text-sm text-gray-900">{mapping.code}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">카테고리</dt>
                            <dd className="text-sm text-gray-900">{mapping.category || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">서비스</dt>
                            <dd className="text-sm text-gray-900">{mapping.service || '-'}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">점검 방법</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-xs text-gray-500">점검 방식</dt>
                            <dd className="text-sm text-gray-900">{mapping.check_how || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">콘솔 경로</dt>
                            <dd className="text-sm text-gray-900 break-all">{mapping.console_path || '-'}</dd>
                          </div>
                          {mapping.cli_cmd && (
                            <div>
                              <dt className="text-xs text-gray-500">CLI 명령어</dt>
                              <dd className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">{mapping.cli_cmd}</dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">판단 기준</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-xs text-gray-500">반환 필드</dt>
                            <dd className="text-sm text-gray-900">{mapping.return_field || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">준수 값</dt>
                            <dd className="text-sm text-green-600">{mapping.compliant_value || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">미준수 값</dt>
                            <dd className="text-sm text-red-600">{mapping.non_compliant_value || '-'}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">수정 방법</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-xs text-gray-500">콘솔 수정</dt>
                            <dd className="text-sm text-gray-900 break-all">{mapping.console_fix || '-'}</dd>
                          </div>
                          {mapping.cli_fix_cmd && (
                            <div>
                              <dt className="text-xs text-gray-500">CLI 수정 명령어</dt>
                              <dd className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                                {mapping.cli_fix_cmd}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Policies2;
