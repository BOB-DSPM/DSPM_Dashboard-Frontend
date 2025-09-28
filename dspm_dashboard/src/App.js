import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, Database, GitBranch, Search, Filter, Bell, FileText, Globe, Users, Server, Activity } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data
  const securityScoreData = { score: 79, trend: '+2%' };
  const issuesByseverity = [
    { name: 'Critical', value: 0, color: '#ef4444' },
    { name: 'High', value: 1, color: '#f97316' },
    { name: 'Medium', value: 149, color: '#eab308' },
    { name: 'Low', value: 98, color: '#22c55e' }
  ];

  const complianceScores = [
    { name: 'GDPR', score: 52, color: '#3b82f6' },
    { name: 'HIPAA', score: 84, color: '#10b981' },
    { name: 'PCI DSS', score: 54, color: '#f59e0b' },
    { name: 'ISO 27001', score: 61, color: '#8b5cf6' },
    { name: 'SOC 2', score: 64, color: '#ef4444' }
  ];

  const inventoryData = [
    { name: 'AWS DocumentDB', count: 3, type: 'database' },
    { name: 'AWS DynamoDB', count: 108, type: 'database' },
    { name: 'AWS EC2', count: 1543, type: 'compute' },
    { name: 'AWS Lambda', count: 114, type: 'serverless' },
    { name: 'AWS RDS Aurora', count: 86, type: 'database' }
  ];

  const alertsData = [
    { date: '2024-09-25', opened: 45, resolved: 38 },
    { date: '2024-09-26', opened: 52, resolved: 41 },
    { date: '2024-09-27', opened: 38, resolved: 45 },
    { date: '2024-09-28', opened: 41, resolved: 39 }
  ];

  const dataClassification = [
    { name: 'PII', value: 269, color: '#3b82f6' },
    { name: 'Digital Identity', value: 120, color: '#10b981' },
    { name: 'Financial', value: 49, color: '#f59e0b' },
    { name: 'PHI', value: 4, color: '#ef4444' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'inventory', name: 'Inventory', icon: Database },
    { id: 'alerts', name: 'Alerts', icon: Bell },
    { id: 'policies', name: 'Policies', icon: Shield },
    { id: 'lineage', name: 'Lineage', icon: GitBranch }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-2xl font-bold text-blue-600">{securityScoreData.score}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-green-600">1,854</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-orange-600">248</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance</p>
              <p className="text-2xl font-bold text-purple-600">63%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Severity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Data Issues by Severity</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              {issuesByseverity.map((item) => (
                <div key={item.name} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">248</div>
              <div className="text-sm text-gray-500">Total Issues</div>
            </div>
          </div>
        </div>

        {/* Data Classification */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Classification by Data Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataClassification}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                {dataClassification.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dataClassification.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Trend */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Alerts Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={alertsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="opened" stackId="1" stroke="#ef4444" fill="#fecaca" />
              <Area type="monotone" dataKey="resolved" stackId="1" stroke="#22c55e" fill="#bbf7d0" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Scores */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Compliance Scores</h3>
          <div className="space-y-4">
            {complianceScores.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.score}%`, 
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-8">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Data Resources Inventory</h3>
        <div className="space-y-3">
          {inventoryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{item.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item.type}</span>
              </div>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Security Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium">Publicly readable bucket detected</p>
                <p className="text-sm text-gray-600">S3 bucket allows direct anonymous read access</p>
              </div>
            </div>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">High</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium">Unencrypted database connection</p>
                <p className="text-sm text-gray-600">Database connection without SSL/TLS encryption</p>
              </div>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Medium</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Policy Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceScores.map((policy) => (
            <div key={policy.name} className="border rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-lg">{policy.name}</h4>
                <div className="text-2xl font-bold mt-2" style={{ color: policy.color }}>
                  {policy.score}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${policy.score}%`, 
                      backgroundColor: policy.color 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLineage = () => (
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'inventory':
        return renderInventory();
      case 'alerts':
        return renderAlerts();
      case 'policies':
        return renderPolicies();
      case 'lineage':
        return renderLineage();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">DSPM Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assets, policies, alerts..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="database">Database</option>
                <option value="compute">Compute</option>
                <option value="storage">Storage</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
