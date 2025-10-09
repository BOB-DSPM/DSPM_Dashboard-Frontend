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
import { Activity, Database, Bell, Shield, GitBranch,  Cloud,Target  } from 'lucide-react';

const tabs = [
  { id: 'overview', name: 'Overview', icon: Activity },
  { id: 'aws-setup', name: 'AWS Setup', icon: Cloud },
  { id: 'data-target', name: 'Data Target', icon: Target },
  { id: 'lineage', name: 'Lineage', icon: GitBranch },
  { id: 'policies', name: 'Compliance Status', icon: Shield },
  { id: 'policies2', name: 'Policies', icon: Shield },
  { id: 'alerts', name: 'Alerts', icon: Bell },
  ///{ id: 'inventory', name: 'Inventory', icon: Database },
];

const App = () => {
  console.log('App is rendering');

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('overview');
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview securityScoreData={{ score: 79 }} />;
      case 'data-target': return <Inventory activeTab={activeTab} />;
      case 'alerts': return <Alerts />;
      case 'policies': return <Policies />;
      case 'policies2': return <Policies2 />;
      case 'lineage': return <Lineage />;
      case 'aws-setup': return <AwsSetup />;      
      default: return <Overview securityScoreData={{ score: 79 }} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onLogout={handleLogout} />
      <div className="flex flex-1">
        <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 px-6 py-8 ">{renderContent()}</div>
      </div>
    </div>
  );
};

export default App;