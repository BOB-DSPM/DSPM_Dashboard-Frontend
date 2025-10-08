import { useState, useEffect } from 'react';

export const useDataTarget = (activeTab) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'data-target') {
      const fetchInventory = async () => {
        setLoadingInventory(true);
        setError(null);
        try {
          const response = await fetch('/api/all-resources');
          
          if (response.ok) {
            const data = await response.json();
            console.log('Received resources data:', data);
            
            const formattedResources = formatResources(data);
            setInventoryData(formattedResources);
          } else {
            setError(`Failed to fetch resources: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error fetching inventory data:', error);
          setError(error.message);
        } finally {
          setLoadingInventory(false);
        }
      };
      fetchInventory();
    }
  }, [activeTab]);

  return { inventoryData, loadingInventory, error };
};

// 리소스 데이터 포맷 변환 함수
const formatResources = (data) => {
  const result = [];
  
  const typeMap = {
    s3_buckets: { type: 's3', label: 'S3 Bucket', nameKey: 'name' },
    ebs_volumes: { type: 'ebs', label: 'EBS Volume', nameKey: 'volume_id' },
    efs_filesystems: { type: 'efs', label: 'EFS', nameKey: 'file_system_id' },
    fsx_filesystems: { type: 'fsx', label: 'FSx', nameKey: 'file_system_id' },
    rds_instances: { type: 'rds', label: 'RDS Instance', nameKey: 'db_instance_identifier' },
    rds_snapshots: { type: 'rds_snapshot', label: 'RDS Snapshot', nameKey: 'db_snapshot_identifier' },
    dynamodb_tables: { type: 'dynamodb', label: 'DynamoDB', nameKey: 'name' },
    redshift_clusters: { type: 'redshift', label: 'Redshift', nameKey: 'cluster_identifier' },
    elasticache_clusters: { type: 'elasticache', label: 'ElastiCache', nameKey: 'cache_cluster_id' },
    glacier_vaults: { type: 'glacier', label: 'Glacier', nameKey: 'vault_name' },
    backup_plans: { type: 'backup', label: 'Backup Plan', nameKey: 'name' },
    glue_databases: { type: 'glue', label: 'Glue Database', nameKey: 'name' },
    kinesis_streams: { type: 'kinesis', label: 'Kinesis Stream', nameKey: 'stream_name' },
    msk_clusters: { type: 'msk', label: 'MSK Cluster', nameKey: 'cluster_name' }
  };
  
  Object.entries(data).forEach(([category, items]) => {
    if (category === 'feature_groups' && typeof items === 'object' && !Array.isArray(items)) {
      // feature_groups는 객체 형태로 온다
      Object.entries(items).forEach(([name, details]) => {
        result.push({
          id: `feature_group-${name}`,
          type: 'feature_group',
          typeLabel: 'Feature Group',
          name: name,
          details: { name, ...details }
        });
      });
    } else if (Array.isArray(items) && items.length > 0) {
      const config = typeMap[category];
      if (config) {
        items.forEach(item => {
          result.push({
            id: `${config.type}-${item[config.nameKey]}`,
            type: config.type,
            typeLabel: config.label,
            name: item[config.nameKey] || item.name || 'Unknown',
            details: item
          });
        });
      }
    }
  });
  
  return result;
};
