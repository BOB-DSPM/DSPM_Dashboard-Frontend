import React, { useState } from 'react';
import Login from './pages/Login';
import Header from './components/navigation/Header';
import Sidebar from './components/navigation/Sidebar';
import Overview from './pages/Overview';
import Inventory from './pages/DataTarget';
import Alerts from './pages/Alerts';
import Policies from './pages/Policies';
import Policies2 from './pages/Policies2';
import Lineage from './pages/Lineage';
import AwsSetup from './pages/AwsSetup';
import { Activity, Database, Bell, Shield, GitBranch, Cloud, Target } from 'lucide-react';

const tabs = [
  { id: 'overview', name: 'Overview', icon: Activity },
  { id: 'aws-setup', name: 'AWS Setup', icon: Cloud },
  { id: 'data-target', name: 'Data Target', icon: Target },
  { id: 'lineage', name: 'Lineage', icon: GitBranch },
  { id: 'policies', name: 'Compliance Status', icon: Shield },
  { id: 'policies2', name: 'Policies', icon: Shield },
  { id: 'alerts', name: 'Alerts', icon: Bell },
];

const App = () => {
  console.log('App is rendering');

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [componentKeys, setComponentKeys] = useState({
    overview: 0,
    'aws-setup': 0,
    'data-target': 0,
    lineage: 0,
    policies: 0,
    policies2: 0,
    alerts: 0,
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('overview');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // 컴포넌트 재마운트를 위해 key 증가
    setComponentKeys(prev => ({
      ...prev,
      [tabId]: prev[tabId] + 1
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview key={componentKeys.overview} securityScoreData={{ score: 79 }} />;
      case 'data-target':
        return <Inventory key={componentKeys['data-target']} activeTab={activeTab} />;
      case 'alerts':
        return <Alerts key={componentKeys.alerts} />;
      case 'policies':
        return <Policies key={componentKeys.policies} />;
      case 'policies2':
        return <Policies2 key={componentKeys.policies2} />;
      case 'lineage':
        return <Lineage key={componentKeys.lineage} />;
      case 'aws-setup':
        return <AwsSetup key={componentKeys['aws-setup']} />;
      default:
        return <Overview key={componentKeys.overview} securityScoreData={{ score: 79 }} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onLogout={handleLogout} />
      <div className="flex flex-1">
        <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={handleTabChange} />
        <div className="flex-1 px-6 py-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default App;