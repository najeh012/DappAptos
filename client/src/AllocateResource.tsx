import React, { useEffect, useState } from 'react';
import { Card, message, Descriptions, Col, Row, Input, Button, Drawer } from 'antd';
import { DesktopOutlined, HddOutlined, CloudOutlined, DeleteOutlined } from '@ant-design/icons';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import './ShareResources.css';

// Module account address
export const moduleAddress = "0x5e813ba3119157037e064b59853879ed4f232e69f2e980c108e61b97b72ad96f";
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Define interfaces
interface ResourceProvider {
  address: string;
  cpu: string;
  gpu: string;
  ram: number; // Add this line
  storage: number; // Add this line
  is_external: boolean;
}

interface ResourceProviders {
  providers: ResourceProvider[];
}

const ShareResources: React.FC = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [registeredResources, setRegisteredResources] = useState<ResourceProvider[]>([]);
  const [modelIpfsLink, setModelIpfsLink] = useState<string>('');  // State for Model IPFS link
  const [datasetIpfsLink, setDatasetIpfsLink] = useState<string>('');  // State for Dataset IPFS link
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null); // State for selected provider
  const [drawerVisible, setDrawerVisible] = useState(false); // State for drawer visibility
  const [weightsIpfsLink, setWeightsIpfsLink] = useState<string>(''); // State for Model Weights IPFS link
  const [paymentAmount, setPaymentAmount] = useState<number>(0); // State for Payment amount in FLC

  const fetchRegisteredResources = async () => {
    if (!account) {
      console.error("No connected wallet account.");
      message.error('No connected wallet account.');
      return;
    }

    try {
      const resources = await aptos.getAccountResources({
        accountAddress: moduleAddress,
      });

      const resourceProviders = resources.find(
        (res: any) => res.type === `${moduleAddress}::TrusTrain::ResourceProviders`
      );

      if (resourceProviders) {
        const providersData = resourceProviders.data as ResourceProviders;
        setRegisteredResources(providersData.providers);
        message.success('Registered resources fetched successfully.');
      } else {
        message.warning('No resources registered yet.');
      }
    } catch (error: any) {
      console.error('Error fetching registered resources:', error);
      message.error('Failed to fetch registered resources.');
    }
  };

  const hexToString = (hex: string) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  };

  const deleteResource = async (resourceIndex: number) => {
    if (!account) {
      message.error('No connected wallet account.');
      return;
    }

    if (resourceIndex === undefined || resourceIndex < 0) {
      message.error('Invalid resource index.');
      return;
    }

    try {
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::TrusTrain::delete_resource`,
          functionArguments: [
            resourceIndex.toString() // Resource index to delete
          ],
        },
      };

      setTransactionInProgress(true);
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      message.success('Resource deleted successfully.');
      console.log('Transaction response:', response);

      // Refetch registered resources after successful deletion
      fetchRegisteredResources();
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      message.error('Failed to delete resource.');
    } finally {
      setTransactionInProgress(false);
    }
  };

  const payForTraining = async () => {
    if (!account) {
      message.error('No connected wallet account.');
      return;
    }
  
    if (!paymentAmount || selectedProvider === null) {
      message.warning('Please enter a valid payment amount and select a provider.');
      return;
    }
  
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::TrusTrain::pay_for_training`,
        functionArguments: [
          selectedProvider,    // Selected provider's address
          paymentAmount        // Payment amount in FLC
        ],
      },
    };
  
    setTransactionInProgress(true);
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      message.success('Payment sent successfully.');
      console.log("Transaction response:", response);
    } catch (error: any) {
      console.error('Error sending payment:', error);
      message.error('Failed to send payment.');
    } finally {
      setTransactionInProgress(false);
    }
  };

  const submitTrainingRequest = async () => {
    console.log("Selected Provider:", selectedProvider);
    console.log("Model IPFS Link:", modelIpfsLink);
    console.log("Dataset IPFS Link:", datasetIpfsLink);
  
    if (!account) {
      message.error('No connected wallet account.');
      return;
    }
  
    if (!modelIpfsLink || !datasetIpfsLink || !selectedProvider) {
      message.warning('Please enter both IPFS links and select a provider.');
      return;
    }
  
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::TrusTrain::submit_training_request`,
        functionArguments: [
          selectedProvider,   // Selected provider's address
          modelIpfsLink,     // User input model IPFS link
          datasetIpfsLink    // User input dataset IPFS link
        ],
      },
    };
  
    setTransactionInProgress(true);
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      message.success('Training request submitted successfully.');
      console.log("Transaction response:", response);
      setDrawerVisible(false);  // Close the drawer after submission
    } catch (error: any) {
      console.error('Error submitting training request:', error);
      message.error('Failed to submit training request.');
    } finally {
      setTransactionInProgress(false);
    }
  };

  const showDrawer = (providerAddress: string) => {
    console.log("Selected Provider Address:", providerAddress); // Log the provider address
    setSelectedProvider(providerAddress);
    setDrawerVisible(true); // Open drawer
  };

  useEffect(() => {
    fetchRegisteredResources();
  }, [account]);

  return (
    <div className="share-resources">
      <Card title="Registered Resources" bordered={false}>
        {registeredResources.length > 0 ? (
          <Row gutter={[16, 16]}>
            {registeredResources.map((provider, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  className="resource-card"
                >
                  <Descriptions title={`Provider ${index + 1}`} bordered column={1} size="small">
                    <Descriptions.Item label="Address">{provider.address}</Descriptions.Item>
                    <Descriptions.Item label="CPU">
                      <DesktopOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {hexToString(provider.cpu)}
                    </Descriptions.Item>
                    <Descriptions.Item label="GPU">
                      <HddOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                      {hexToString(provider.gpu)}
                    </Descriptions.Item>
                    <Descriptions.Item label="RAM (GB)">
                      {provider.ram} 
                    </Descriptions.Item>
                    <Descriptions.Item label="Storage (GB)">
                      {provider.storage} 
                    </Descriptions.Item>
                    <Descriptions.Item label="External">
                      <CloudOutlined style={{ color: provider.is_external ? '#faad14' : '#bfbfbf', marginRight: 8 }} />
                      {provider.is_external ? 'Yes' : 'No'}
                    </Descriptions.Item>
                  </Descriptions>
                  <Button
                      type='primary'
                        onClick={() => showDrawer(provider.address)} // Wrap the call to showDrawer in an inline function
                    >
                      Request The Provider
                    </Button>
                  {/* Add Delete button */}
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteResource(index)} // Call deleteResource with the resource index
                    disabled={transactionInProgress} // Disable while transaction is in progress
                    style={{ marginTop: 16 }}
                  >
                    Delete Resource
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No resources registered yet.</p>
        )}
      </Card>

      {/* Drawer for IPFS inputs and submit button */}
      <Drawer
        title="Enter IPFS Links"
        placement="right"
        onClose={() => setDrawerVisible(false)}  // Close drawer
        visible={drawerVisible}
        width={400}
      >
        <Input
          placeholder="Model IPFS/ cloud Link"
          value={modelIpfsLink}
          onChange={(e) => setModelIpfsLink(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Dataset IPFS/ cloud Link"
          value={datasetIpfsLink}
          onChange={(e) => setDatasetIpfsLink(e.target.value)}
          style={{ marginBottom: 20 }}
        />
        <Button
          type="primary"
          onClick={submitTrainingRequest}  // Handle form submission
          loading={transactionInProgress}  // Show loading while transaction is in progress
          disabled={transactionInProgress} // Disable button while processing
        >
          Submit Training Request
        </Button>
      </Drawer>
    </div>
  );
};

export default ShareResources;
