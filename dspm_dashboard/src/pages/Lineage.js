import React from 'react';
import { GitBranch } from 'lucide-react';

const Lineage = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Data Flow Lineage</h3>
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Data lineage visualization</p>
          <p className="text-sm text-gray-400">Data → Model → Deployment flow</p>
        </div>
      </div>
    </div>
  </div>
);

export default Lineage;
