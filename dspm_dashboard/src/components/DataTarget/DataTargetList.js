// src/components/DataTarget/DataTargetList.js 수정
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResourceCard from './ResourceCard';
import DetailPanel from './DetailPanel';
import { aegisApi } from '../../services/aegisApi';

const DataTargetList = ({ inventoryData, loading }) => {
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedResources, setSelectedResources] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [isSending, setIsSending] = useState(false);

  // 모든 리소스 타입 정의
  const allResourceTypes = [
    { type: 's3', label: 'S3' },
    { type: 'ebs', label: 'EBS' },
    { type: 'efs', label: 'EFS' },
    { type: 'fsx', label: 'FSx' },
    { type: 'rds', label: 'RDS' },
    { type: 'rds_snapshot', label: 'RDS_SNAPSHOT' },
    { type: 'dynamodb', label: 'DynamoDB' },
    { type: 'redshift', label: 'Redshift' },
    { type: 'elasticache', label: 'ElastiCache' },
    { type: 'glacier', label: 'Glacier' },
    { type: 'backup', label: 'Backup' },
    { type: 'feature_group', label: 'Feature Group' },
    { type: 'glue', label: 'Glue' },
    { type: 'kinesis', label: 'Kinesis' },
    { type: 'msk', label: 'MSK' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">리소스를 불러오는 중...</div>
      </div>
    );
  }

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
  };

  const toggleResourceSelection = (e, resourceId) => {
    e.stopPropagation();
    const newSelected = new Set(selectedResources);
    if (newSelected.has(resourceId)) {
      newSelected.delete(resourceId);
    } else {
      newSelected.add(resourceId);
    }
    setSelectedResources(newSelected);
  };

  // 전체 선택/해제 기능 추가
  const handleSelectAll = () => {
    const filteredIds = filteredResources.map(r => r.id);
    const allSelected = filteredIds.every(id => selectedResources.has(id));
    
    if (allSelected) {
      // 현재 필터의 모든 항목 선택 해제
      const newSelected = new Set(selectedResources);
      filteredIds.forEach(id => newSelected.delete(id));
      setSelectedResources(newSelected);
    } else {
      // 현재 필터의 모든 항목 선택
      const newSelected = new Set(selectedResources);
      filteredIds.forEach(id => newSelected.add(id));
      setSelectedResources(newSelected);
    }
  };

  const handleSendToAnalyzer = async () => {
    if (selectedResources.size === 0) {
      alert('위협 식별할 저장소를 선택해주세요.');
      return;
    }

    setIsSending(true);

    try {
      const selectedItems = inventoryData.filter(item => 
        selectedResources.has(item.id)
      );

      console.log('선택된 리소스:', selectedItems);

      const response = await aegisApi.triggerCollect(true);
      
      console.log('API 응답 전체:', response);

      if (response) {
        console.log('성공! 결과 페이지로 이동합니다.');
        
        navigate('/aegis-results', {
          state: {
            services: selectedItems.map(item => item.name || item.id),
            timestamp: new Date().toISOString(),
            selectedItems: selectedItems,
            collectResponse: response
          }
        });
      } else {
        console.error('응답이 null 또는 undefined:', response);
        alert('분석 요청에 실패했습니다. (응답 없음)');
      }

    } catch (error) {
      console.error('전송 실패:', error);
      console.error('에러 상세:', error.message);
      alert('전송 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const filteredResources = filter === 'all' 
    ? inventoryData 
    : inventoryData.filter(r => r.type === filter);

  const getResourceCount = (type) => {
    return inventoryData.filter(r => r.type === type).length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AWS 리소스 인벤토리</h3>
              <p className="text-gray-600">총 {inventoryData.length}개의 리소스 | {selectedResources.size}개 선택됨</p>
            </div>
            
            {selectedResources.size > 0 && (
              <button
                onClick={handleSendToAnalyzer}
                disabled={isSending}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    전송 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    위협 식별 시작 ({selectedResources.size})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            전체 ({inventoryData.length})
          </button>
          
          {/* 전체 선택/해제 버튼 추가 */}
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 rounded-lg transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {filteredResources.length > 0 && filteredResources.every(r => selectedResources.has(r.id)) ? '전체 해제' : '전체 선택'}
          </button>
          
          {allResourceTypes.map(({ type, label }) => {
            const count = getResourceCount(type);
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === type ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } ${count === 0 ? 'opacity-50' : ''}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <div key={resource.id} className="relative">
                <ResourceCard
                  resource={resource}
                  onClick={() => handleResourceClick(resource)}
                  isSelected={selectedResources.has(resource.id)}
                  isDetailViewing={selectedResource?.id === resource.id}
                />
                <div className="absolute top-2 right-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedResources.has(resource.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleResourceSelection(e, resource.id);
                    }}
                    className="w-5 h-5 text-primary-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {filter === 'all' ? '리소스가 없습니다.' : `${allResourceTypes.find(t => t.type === filter)?.label} 리소스가 없습니다.`}
          </div>
        )}
      </div>

      {selectedResource && (
        <DetailPanel 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)} 
        />
      )}
    </div>
  );
};

export default DataTargetList;