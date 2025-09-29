import React, { useState } from 'react';
import Login from './pages/Login';
import Sidebar from './components/navigation/Sidebar';
import Overview from './pages/Overview';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';
import Policies from './pages/Policies';
import Lineage from './pages/Lineage';
import { Activity, Database, Bell, Shield, GitBranch } from 'lucide-react';

const tabs = [
  { id: 'overview', name: 'Overview', icon: Activity },
  { id: 'inventory', name: 'Inventory', icon: Database },
  { id: 'alerts', name: 'Alerts', icon: Bell },
  { id: 'policies', name: 'Policies', icon: Shield },
  { id: 'lineage', name: 'Lineage', icon: GitBranch }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview securityScoreData={{ score: 79 }} />;
      case 'inventory': return <Inventory activeTab={activeTab} />;
      case 'alerts': return <Alerts />;
      case 'policies': return <Policies />;
      case 'lineage': return <Lineage />;
      default: return <Overview securityScoreData={{ score: 79 }} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 px-6 py-8 mt-12">{renderContent()}</div>
      </div>
    </div>
  );
};

export default App;

