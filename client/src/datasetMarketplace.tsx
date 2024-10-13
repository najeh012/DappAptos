import React, { useEffect, useState } from 'react';
import { Card, message, List, Button, Descriptions, InputNumber, Modal } from 'antd';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { LinkOutlined } from '@ant-design/icons';
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

// Module account address
export const moduleAddress = "0xcb2f626b41f47f250262619e734dcddfe66c59a7312548578b44a278def5921a";

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
  const { account, signAndSubmitTransaction } = useWallet();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<DatasetInfo | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  // Call access_dataset on the blockchain
  const accessDataset = async (datasetIndex: number, dataset: DatasetInfo) => {
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::TrusTrain::access_dataset`,
        functionArguments: [
          datasetIndex,          // The index of the selected dataset
          paymentAmount          // The payment amount
        ],
      },
    };

    setTransactionInProgress(true);
    try {
      const response = await signAndSubmitTransaction(transaction); // Use wallet API or SDK method
      await aptos.waitForTransaction({ transactionHash: response.hash });
      message.success('Access granted to the dataset.');
      console.log("Transaction response:", response);

      // Open the dataset link after successful payment
      window.open(dataset.ipfs_link, '_blank');
    } catch (error: any) {
      console.error("Error accessing dataset:", error);
      message.error("Failed to access dataset.");
    } finally {
      setTransactionInProgress(false);
    }
  };

  // Handle dataset access button click
  const handleAccess = (dataset: DatasetInfo, index: number) => {
    setSelectedDataset(dataset);
    if (dataset.free) {
      // For free datasets, open the link directly
      window.open(dataset.ipfs_link, '_blank');
    } else {
      // Show modal to ask for payment amount for paid datasets
      setModalVisible(true);
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirm = () => {
    if (selectedDataset) {
      const datasetIndex = datasets.indexOf(selectedDataset);
      accessDataset(datasetIndex, selectedDataset);
      setModalVisible(false);
    }
  };

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
                    
                    <Descriptions.Item label="Free">
                      {dataset.free ? "Yes" : "No"}
                    </Descriptions.Item>
                    {!dataset.free && (
                      <Descriptions.Item label="Price">{dataset.price} Tokens</Descriptions.Item>
                    )}
                  </Descriptions>
                  <Button
                    type="primary"
                    onClick={() => handleAccess(dataset, index)}
                    disabled={transactionInProgress}
                  >
                    {dataset.free ? 'Access Dataset' : 'Pay & Access'}
                  </Button>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <p>No datasets shared yet.</p>
        )}
      </Card>

      {/* Modal for entering payment amount */}
      <Modal
        title="Pay for Dataset Access"
        visible={modalVisible}
        onOk={handlePaymentConfirm}
        onCancel={() => setModalVisible(false)}
        okText="Pay & Access"
      >
        <p>This dataset requires a payment of {selectedDataset?.price} Tokens.</p>
        <InputNumber
          min={selectedDataset?.price}
          value={paymentAmount}
          onChange={(value) => setPaymentAmount(value || 0)}
        />
      </Modal>
    </div>
  );
};

export default DatasetMarketplace;
