import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_BASE = '';

const Policies2 = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [mappingDetail, setMappingDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/compliance/compliance/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Frameworks data:', data);
      setFrameworks(data);
    } catch (error) {
      console.error('프레임워크 조회 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async (frameworkCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/compliance/compliance/${frameworkCode}/requirements`);
      const data = await response.json();
      setRequirements(data);
      setSelectedFramework(frameworkCode);
      setSelectedRequirement(null);
      setMappingDetail(null);
    } catch (error) {
      console.error('요구사항 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMappingDetail = async (frameworkCode, reqId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/compliance/compliance/${frameworkCode}/requirements/${reqId}/mappings`);
      const data = await response.json();
      setMappingDetail(data);
      setSelectedRequirement(reqId);
    } catch (error) {
      console.error('매핑 상세 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMappingStatusIcon = (status) => {
    if (status === 'Mapped') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'Partial') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Compliance Policies</h1>
      </div>
      
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button 
          onClick={() => {
            setSelectedFramework(null);
            setRequirements([]);
            setMappingDetail(null);
          }}
          className="hover:text-blue-600"
        >
          Frameworks
        </button>
        {selectedFramework && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => {
                setMappingDetail(null);
                setSelectedRequirement(null);
              }}
              className="hover:text-blue-600"
            >
              {selectedFramework}
            </button>
          </>
        )}
        {selectedRequirement && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Requirement #{selectedRequirement}</span>
          </>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">에러: {error}</p>
        </div>
      )}

      {/* 1단계: 프레임워크 목록 */}
      {!selectedFramework && !loading && (
        <>
          {frameworks.length === 0 && !error ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
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

      {/* 2단계: 요구사항 목록 */}
      {selectedFramework && !mappingDetail && !loading && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedFramework} Requirements</h2>
              <span className="text-sm text-gray-500">{requirements.length} 항목</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    항목 코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매핑 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requirements.map((req) => (
                  <tr 
                    key={req.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => fetchMappingDetail(selectedFramework, req.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.item_code || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {req.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getMappingStatusIcon(req.mapping_status)}
                        <span className="text-sm text-gray-600">{req.mapping_status || 'Not Mapped'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3단계: 매핑 상세 정보 */}
      {mappingDetail && !loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {mappingDetail.requirement.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>ID: {mappingDetail.requirement.id}</span>
              <span>코드: {mappingDetail.requirement.item_code}</span>
              <div className="flex items-center gap-2">
                {getMappingStatusIcon(mappingDetail.requirement.mapping_status)}
                <span>{mappingDetail.requirement.mapping_status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                매핑 정보 ({mappingDetail.mappings.length}건)
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mappingDetail.mappings.map((mapping, idx) => (
                <div key={idx} className="p-6">
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
                            <dd className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                              {mapping.cli_cmd}
                            </dd>
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
      )}
    </div>
  );
};

export default Policies2;