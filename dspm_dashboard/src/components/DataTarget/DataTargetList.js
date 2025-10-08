import React, { useState } from 'react';
import ResourceCard from './ResourceCard';
import DetailPanel from './DetailPanel';

const DataTargetList = ({ inventoryData, loading }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedResources, setSelectedResources] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [isSending, setIsSending] = useState(false);

  // 모든 리소스 타입 정의 (데이터 유무 관계없이)
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

  // 선택한 리소스 전송 함수
  const handleSendToAnalyzer = async () => {
    if (selectedResources.size === 0) {
      alert('위협 식별할 저장소를 선택해주세요.');
      return;
    }

    setIsSending(true);

    try {
      // 선택된 리소스 정보 수집
      const selectedItems = inventoryData.filter(item => 
        selectedResources.has(item.id)
      );

      console.log('선택된 리소스:', selectedItems);

      // TODO: 여기에 실제 API 호출 추가
      // const response = await fetch('/api/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ resources: selectedItems })
      // });

      // 임시: 2초 후 성공 메시지
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`${selectedResources.size}개의 리소스가 인벤토리로 전송되었습니다.`);
      
      // 선택 초기화
      setSelectedResources(new Set());

    } catch (error) {
      console.error('전송 실패:', error);
      alert('전송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredResources = filter === 'all' 
    ? inventoryData 
    : inventoryData.filter(r => r.type === filter);

  // 각 타입별 리소스 개수 계산
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
            
            {/* 전송 버튼 */}
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