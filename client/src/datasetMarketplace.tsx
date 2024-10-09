import React, { useEffect, useState } from 'react';
import { Card, message, List, Button, Descriptions } from 'antd';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { LinkOutlined } from '@ant-design/icons';

// Module account address
export const moduleAddress = "0xa510692ad98680b398e472cf40b71b3b46b771b44cdf59eda99707e18db78784";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Define interfaces for DatasetInfo and DatasetsInfo
interface DatasetInfo {
  description: string;
  ipfs_link: string;
  provider_address: string;
  free: boolean;      
  price: number;  
}

interface DatasetsInfo {
  datasets: DatasetInfo[];
}

const DatasetMarketplace: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to decode hex string (like 0x696e74656c2d69352d31317468) to a readable string
  const hexToString = (hex: string): string => {
    hex = hex.startsWith('0x') ? hex.slice(2) : hex;
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  };

  // Fetch datasets
  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: moduleAddress,
      });

      const datasetsResource = resources.find(
        (res: any) => res.type === `${moduleAddress}::TrusTrain::DatasetsInfo`
      );

      if (datasetsResource) {
        const datasetsData = datasetsResource.data as DatasetsInfo;

        const datasetList = datasetsData.datasets.map((dataset) => ({
          description: hexToString(dataset.description), // Decode the description
          ipfs_link: hexToString(dataset.ipfs_link),     // Decode the IPFS link
          provider_address: dataset.provider_address,
          free: dataset.free,
          price: dataset.price,
        }));

        setDatasets(datasetList);
        message.success('Datasets fetched successfully.');
      } else {
        message.warning('No datasets found.');
      }
    } catch (error: any) {
      console.error('Error fetching datasets:', error);
      message.error('Failed to fetch datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="dataset-marketplace">
      <Card title="Shared Datasets" bordered={false} loading={loading}>
        {datasets.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={datasets}
            renderItem={(dataset, index) => (
              <List.Item key={index}>
                <Card bordered={true} style={{ marginBottom: '16px' }}>
                  <Descriptions title={`Dataset from Provider: ${dataset.provider_address}`} bordered>
                    <Descriptions.Item label="Provider Address">{dataset.provider_address}</Descriptions.Item>
                    <Descriptions.Item label="Description">{dataset.description}</Descriptions.Item>
                    <Descriptions.Item label="IPFS Link">
                    <Descriptions.Item label="Free">
                      {dataset.free ? "Yes" : "No"}
                    </Descriptions.Item>
                    {!dataset.free && (
                      <Descriptions.Item label="Price">{dataset.price} Tokens</Descriptions.Item>
                    )}
                      <Button
                        type="link"
                        href={dataset.ipfs_link}
                        target="_blank"
                        icon={<LinkOutlined />}
                      >
                        View Dataset
                      </Button>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <p>No datasets shared yet.</p>
        )}
      </Card>
    </div>
  );
};

export default DatasetMarketplace;
