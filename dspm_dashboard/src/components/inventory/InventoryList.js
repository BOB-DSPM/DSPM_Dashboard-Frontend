import React, { useState } from 'react';
import ResourceCard from './ResourceCard';
import DetailPanel from './DetailPanel';

const InventoryList = ({ inventoryData, loading }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedResources, setSelectedResources] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  // API 엔드포인트 매핑
  const getDetailEndpoint = (resource) => {
    const endpointMap = {
      's3': `/api/repositories/s3/${resource.name}`,
      'efs': `/api/repositories/efs/${resource.name}`,
      'fsx': `/api/repositories/fsx/${resource.name}`,
      'rds': `/api/repositories/rds/${resource.name}`,
      'dynamodb': `/api/repositories/dynamodb/${resource.name}`,
      'redshift': `/api/repositories/redshift/${resource.name}`,
      'rds_snapshot': `/api/repositories/rds-snapshot/${resource.name}`,
      'elasticache': `/api/repositories/elasticache/${resource.name}`,
      'glacier': `/api/repositories/glacier/${resource.name}`,
      'backup': `/api/repositories/backup/${resource.name}`,
      'feature_group': `/api/repositories/feature-group/${resource.name}`,
      'glue': `/api/repositories/glue/${resource.name}`,
      'kinesis': `/api/repositories/kinesis/${resource.name}`,
      'msk': `/api/repositories/msk/${resource.name}`
    };
    
    return endpointMap[resource.type];
  };

  const handleResourceClick = async (resource) => {
    setLoadingDetail(true);
    try {
      const endpoint = getDetailEndpoint(resource);
      if (!endpoint) {
        setSelectedResource(resource);
        return;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const detailData = await response.json();
        
        // 배열로 오면 첫 번째 요소 사용, 객체면 그대로 사용
        const details = Array.isArray(detailData) ? detailData[0] : detailData;
        
        setSelectedResource({
          ...resource,
          details: details
        });
      } else {
        setSelectedResource(resource);
      }
    } catch (error) {
      console.error('Error:', error);
      setSelectedResource(resource);
    } finally {
      setLoadingDetail(false);
    }
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

  const getResourceCount = (type) => {
    return inventoryData.filter(r => r.type === type).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">리소스를 불러오는 중...</div>
      </div>
    );
  }

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

      {selectedResource ? (
        <DetailPanel 
          resource={selectedResource}
          loading={loadingDetail}
          onClose={() => setSelectedResource(null)} 
        />
      ) : null}
    </div>
  );
};

export default InventoryList;