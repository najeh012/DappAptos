import React, { useEffect, useState } from 'react';
import { Card, message, Descriptions, Col, Row, Input, Button, Drawer } from 'antd';
import { DesktopOutlined, HddOutlined, CloudOutlined } from '@ant-design/icons';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import './ShareResources.css';

// Module account address
export const moduleAddress = "0xba910884da53913141fdfa5402d9eb75ef3822183be3c38611e0f732b13ec3e3";
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Define interfaces
interface ResourceProvider {
  address: string;
  cpu: number;
  gpu: number;
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

  // Function to submit a training request when a provider is selected
  const submitTrainingRequest = async () => {
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

  // Show panel with IPFS inputs when provider is selected
  const showDrawer = (providerAddress: string) => {
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
                  onClick={() => showDrawer(provider.address)} // Handle click with selected provider
                >
                  <Descriptions title={`Provider ${index + 1}`} bordered column={1} size="small">
                    <Descriptions.Item label="Address">{provider.address}</Descriptions.Item>
                    <Descriptions.Item label="CPU">
                      <DesktopOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {provider.cpu}
                    </Descriptions.Item>
                    <Descriptions.Item label="GPU">
                      <HddOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                      {provider.gpu}
                    </Descriptions.Item>
                    <Descriptions.Item label="External">
                      <CloudOutlined style={{ color: provider.is_external ? '#faad14' : '#bfbfbf', marginRight: 8 }} />
                      {provider.is_external ? 'Yes' : 'No'}
                    </Descriptions.Item>
                  </Descriptions>
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
          placeholder="Model IPFS Link"
          value={modelIpfsLink}
          onChange={(e) => setModelIpfsLink(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Dataset IPFS Link"
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
