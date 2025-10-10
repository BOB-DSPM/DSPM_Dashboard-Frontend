// src/pages/AegisResults.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aegisApi } from '../services/aegisApi';
import { AlertTriangle, CheckCircle, XCircle, Info, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const AegisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { services, timestamp } = location.state || {};

  console.log('AegisResults - location.state:', location.state);
  console.log('AegisResults - services:', services);
  console.log('AegisResults - timestamp:', timestamp);

  const [items, setItems] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [isAnalyzing, setIsAnalyzing] = useState(true); // 분석 중 여부

  const pageSize = 20;

  // 초기 로드
  useEffect(() => {
    console.log('AegisResults - useEffect 실행');
    loadData();
    loadStats();
  }, [currentPage, selectedCategory]);

  // 자동 새로고침 (10초마다)
  useEffect(() => {
    if (!autoRefresh || !isAnalyzing) return;

    const interval = setInterval(() => {
      console.log('자동 새로고침 실행');
      loadData();
      loadStats();
      setCountdown(10);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, isAnalyzing, currentPage, selectedCategory]);

  // 카운트다운
  useEffect(() => {
    if (!autoRefresh || !isAnalyzing) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 10;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [autoRefresh, isAnalyzing]);

  const loadData = async () => {
    console.log('loadData 시작');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aegisApi.getFrontList({
        page: currentPage,
        size: pageSize,
        category: selectedCategory || undefined,
      });

      console.log('getFrontList 응답:', response);

      setItems(response.items || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / pageSize));
    } catch (err) {
      console.error('loadData 에러:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    console.log('loadStats 시작');
    try {
      const [countsData, statsData] = await Promise.all([
        aegisApi.getCategoryCounts(),
        aegisApi.getFrontStats()
      ]);
      
      console.log('getCategoryCounts 응답:', countsData);
      console.log('getFrontStats 응답:', statsData);
      
      setCategoryCounts(countsData);
      setStats(statsData);

      // 분석 완료 여부 판단
      // total_objects가 0보다 크면 분석이 완료된 것
      if (statsData && statsData.total_objects !== undefined && statsData.total_objects >= 0) {
        setIsAnalyzing(false);
        setAutoRefresh(false);
      }
    } catch (err) {
      console.error('통계 로드 실패:', err);
    }
  };

  const handleManualRefresh = () => {
    loadData();
    loadStats();
    setCountdown(10);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'sensitive': 'bg-red-100 text-red-800 border-red-300',
      'public': 'bg-green-100 text-green-800 border-green-300',
      'identifiers': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'none': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[category] || colors['none'];
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sensitive':
        return <AlertTriangle className="w-4 h-4" />;
      case 'public':
        return <CheckCircle className="w-4 h-4" />;
      case 'identifiers':
        return <Info className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  if (!services) {
    console.log('services가 없음 - 잘못된 접근');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 mb-4">잘못된 접근입니다.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">데이터 위협 분석 결과</h2>
            <p className="text-gray-600 mt-1">
              분석 시작: {new Date(timestamp).toLocaleString('ko-KR')}
            </p>
            {isAnalyzing ? (
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                분석 진행 중... {countdown}초 후 자동 새로고침
              </p>
            ) : stats && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                분석 완료: {stats.total_objects}개 객체 중 {stats.detected_objects}개 검출
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            {isAnalyzing && (
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                  autoRefresh ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                {autoRefresh ? '자동 새로고침 중지' : '자동 새로고침 시작'}
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              돌아가기
            </button>
          </div>
        </div>

        {/* 선택된 서비스 목록 */}
        <div className="flex flex-wrap gap-2">
          {services.map((service, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      {categoryCounts && !isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className={`bg-white rounded-lg p-6 shadow-sm border cursor-pointer transition-all ${
              !selectedCategory ? 'ring-2 ring-primary-600' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            <div className="text-sm text-gray-600 mb-1">전체</div>
            <div className="text-3xl font-bold text-gray-900">{categoryCounts.total}</div>
          </div>

          {Object.entries(categoryCounts.categories || {}).map(([category, count]) => (
            <div
              key={category}
              className={`bg-white rounded-lg p-6 shadow-sm border cursor-pointer transition-all ${
                selectedCategory === category ? 'ring-2 ring-primary-600' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* 분석 중 상태 */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-2xl">⏳</div>
            <div>
              <p className="font-medium text-blue-900">분석이 진행 중입니다</p>
              <p className="text-sm text-blue-700 mt-1">
                데이터를 스캔하고 민감 정보를 탐지하는 중입니다. 잠시만 기다려주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 결과 목록 */}
      {!isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              검출된 항목 ({totalItems}개)
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">로딩 중...</div>
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{item.file}</h4>
                          {item.category && (
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          )}
                          {item.type && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {item.type}
                            </span>
                          )}
                        </div>

                        {item.source && (
                          <p className="text-sm text-gray-600 mb-2">
                            소스: {item.source}
                          </p>
                        )}

                        {item.reason && (
                          <p className="text-sm text-gray-700">{item.reason}</p>
                        )}

                        {item.stats && (
                          <div className="flex gap-4 mt-3 text-sm text-gray-600">
                            {item.stats.rows_scanned && (
                              <span>스캔: {item.stats.rows_scanned}행</span>
                            )}
                            {item.stats.total_entities && (
                              <span>엔티티: {item.stats.total_entities}개</span>
                            )}
                          </div>
                        )}
                      </div>

                      {Object.keys(item.entities || {}).length > 0 && (
                        <div className="ml-4">
                          <span className="text-sm text-gray-600">
                            {Object.keys(item.entities).length}개 엔티티 유형
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="p-6 border-t flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    이전
                  </button>

                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages} 페이지
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    다음
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">분석 완료</p>
              <p className="text-gray-600">
                {selectedCategory 
                  ? `${selectedCategory} 카테고리에서 민감 정보가 검출되지 않았습니다.`
                  : '스캔한 데이터에서 민감 정보가 검출되지 않았습니다.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold">{selectedItem.file}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">기본 정보</h4>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">ID</dt>
                    <dd className="text-sm font-mono text-gray-900">{selectedItem.id}</dd>
                  </div>
                  {selectedItem.source && (
                    <div>
                      <dt className="text-sm text-gray-600">소스</dt>
                      <dd className="text-sm text-gray-900">{selectedItem.source}</dd>
                    </div>
                  )}
                  {selectedItem.type && (
                    <div>
                      <dt className="text-sm text-gray-600">타입</dt>
                      <dd className="text-sm text-gray-900">{selectedItem.type}</dd>
                    </div>
                  )}
                  {selectedItem.category && (
                    <div>
                      <dt className="text-sm text-gray-600">카테고리</dt>
                      <dd>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(selectedItem.category)}`}>
                          {selectedItem.category}
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* 이유 */}
              {selectedItem.reason && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">분류 이유</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedItem.reason}
                  </p>
                </div>
              )}

              {/* 엔티티 정보 */}
              {selectedItem.entities && Object.keys(selectedItem.entities).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">검출된 엔티티</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedItem.entities).map(([entityType, entityData]) => (
                      <div key={entityType} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{entityType}</span>
                          <span className="text-sm text-gray-600">{entityData.count}개</span>
                        </div>
                        {entityData.values && entityData.values.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {entityData.values.slice(0, 5).map((value, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {value}
                              </span>
                            ))}
                            {entityData.values.length > 5 && (
                              <span className="text-xs text-gray-500">
                                +{entityData.values.length - 5}개 더
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 통계 */}
              {selectedItem.stats && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">통계</h4>
                  <dl className="grid grid-cols-2 gap-4">
                    {selectedItem.stats.rows_scanned && (
                      <div>
                        <dt className="text-sm text-gray-600">스캔된 행 수</dt>
                        <dd className="text-sm text-gray-900">{selectedItem.stats.rows_scanned.toLocaleString()}</dd>
                      </div>
                    )}
                    {selectedItem.stats.total_entities && (
                      <div>
                        <dt className="text-sm text-gray-600">총 엔티티 수</dt>
                        <dd className="text-sm text-gray-900">{selectedItem.stats.total_entities.toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AegisResults;