import { useState, useEffect } from 'react';

export const useInventory = (activeTab) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'inventory') {
      const fetchInventory = async () => {
        setLoadingInventory(true);
        setError(null);
        try {
          const response = await fetch('http://analyzer:8080/health');
          
          if (response.ok) {
            const data = await response.json();
            setInventoryData(data);
            setHealthStatus('healthy');
          } else {
            setHealthStatus('unhealthy');
            setError(`Health check failed: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error fetching inventory data:', error);
          setHealthStatus('error');
          setError(error.message);
        } finally {
          setLoadingInventory(false);
        }
      };
      fetchInventory();
    }
  }, [activeTab]);

  return { inventoryData, loadingInventory, healthStatus, error };
};