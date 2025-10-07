import React from 'react';
import { Database, HardDrive, Server, Cloud, Archive, Shield, Activity, FileText, Boxes } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const DetailPanel = ({ resource, loading, onClose }) => {
  if (!resource) return null;
  
  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-xl border-l border-gray-200 overflow-y-auto z-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">리소스 상세정보</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">상세 정보를 불러오는 중...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <ResourceIcon type={resource.type} />
              <div>
                <div className="font-medium text-gray-900">{resource.name}</div>
                <div className="text-sm text-gray-500">{resource.typeLabel}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              {Object.entries(resource.details)
                .filter(([key]) => isNaN(Number(key)))
                .map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs font-medium text-gray-500 uppercase">{key}</div>
                    <div className="mt-1 text-sm break-words">
                      {typeof value === 'object' && value !== null ? (
                        <SyntaxHighlighter 
                          language="json" 
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          {JSON.stringify(value, null, 2)}
                        </SyntaxHighlighter>
                      ) : (
                        <span className="text-gray-900">{String(value ?? 'N/A')}</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;