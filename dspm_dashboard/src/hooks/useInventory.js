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
          const response = await fetch('http://aa9293bd29d714bcea3219ecdbe5b0c7-1378511900.ap-northeast-2.elb.amazonaws.com/api/analyzer/health');
          
          if (response.ok) {
            const data = await response.json();
            console.log('Received data:', data); // 디버깅
            
            // data가 배열인지 확인하고, 아니면 빈 배열로 설정
            if (Array.isArray(data)) {
              setInventoryData(data);
            } else {
              // 객체나 다른 형태면 빈 배열
              setInventoryData([]);
            }
            
            setHealthStatus('healthy!!');
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