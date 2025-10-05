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
        {isSelected && (
          <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;