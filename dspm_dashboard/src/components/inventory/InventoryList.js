
import React, { useState } from 'react';
import ResourceCard from './ResourceCard';
import DetailPanel from './DetailPanel';

const InventoryList = ({ inventoryData, loading }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedResources, setSelectedResources] = useState(new Set());
  const [filter, setFilter] = useState('all');

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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AWS 리소스 인벤토리</h3>
          <p className="text-gray-600">총 {inventoryData.length}개의 리소스 | {selectedResources.size}개 선택됨</p>
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
                <div 
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => toggleResourceSelection(e, resource.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedResources.has(resource.id)}
                    onChange={(e) => toggleResourceSelection(e, resource.id)}
                    className="w-5 h-5 text-primary-600 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
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

export default InventoryList;