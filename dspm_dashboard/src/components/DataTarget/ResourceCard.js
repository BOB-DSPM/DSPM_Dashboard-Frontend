import React from 'react';
import { Database, HardDrive, FileText, Server } from 'lucide-react';

const ResourceCard = ({ resource, onClick, isSelected, isDetailViewing }) => {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 's3':
        return <Database className="w-5 h-5" />;
      case 'ebs':
        return <HardDrive className="w-5 h-5" />;
      case 'rds':
        return <Server className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 's3':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ebs':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'rds':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        border rounded-lg p-4 cursor-pointer transition-all
        ${isDetailViewing 
          ? 'bg-blue-50 border-blue-500 border-2 shadow-lg ring-2 ring-blue-200' 
          : isSelected
            ? 'bg-green-50 border-green-400'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${
          isDetailViewing 
            ? 'bg-blue-200' 
            : isSelected 
              ? 'bg-green-200' 
              : 'bg-gray-100'
        }`}>
          {getIcon(resource.type)}
        </div>
      </div>

      <h4 className={`font-semibold mb-2 break-words ${
        isDetailViewing ? 'text-blue-900' : 'text-gray-900'
      }`}>
        {resource.name}
      </h4>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(resource.type)}`}>
            {resource.type}
          </span>
        </div>

        {resource.region && (
          <p className="text-sm text-gray-600">
            Region: {resource.region}
          </p>
        )}

        {resource.size && (
          <p className="text-sm text-gray-600">
            Size: {resource.size}
          </p>
        )}
      </div>

      {isDetailViewing && (
        <div className="mt-3 pt-3 border-t border-blue-300">
          <p className="text-xs text-blue-700 font-medium">
            상세 정보 보기 중
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceCard;