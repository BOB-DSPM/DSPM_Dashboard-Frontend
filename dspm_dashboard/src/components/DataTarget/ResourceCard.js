import React from 'react';
import { Database, HardDrive, Server, Cloud, Archive, Shield, Activity, FileText, Boxes } from 'lucide-react';

const ResourceIcon = ({ type }) => {
  const iconProps = { size: 24, className: "text-primary-600" };
  
  const icons = {
    s3: <Cloud {...iconProps} />,
    ebs: <HardDrive {...iconProps} />,
    efs: <Server {...iconProps} />,
    fsx: <Server {...iconProps} />,
    rds: <Database {...iconProps} />,
    rds_snapshot: <Archive {...iconProps} />,
    dynamodb: <Database {...iconProps} />,
    redshift: <Database {...iconProps} />,
    elasticache: <Activity {...iconProps} />,
    glacier: <Archive {...iconProps} />,
    backup: <Shield {...iconProps} />,
    feature_group: <Boxes {...iconProps} />,
    glue: <FileText {...iconProps} />,
    kinesis: <Activity {...iconProps} />,
    msk: <Activity {...iconProps} />
  };
  
  return icons[type] || <Database {...iconProps} />;
};

const ResourceCard = ({ resource, onClick, isSelected }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <ResourceIcon type={resource.type} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{resource.name}</div>
          <div className="text-sm text-gray-500">{resource.typeLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;