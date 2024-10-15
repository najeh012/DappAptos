import React, { useEffect, useState } from 'react';
import { Card, message, List, Button, Descriptions, Modal, Input } from 'antd';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { LinkOutlined, DeleteOutlined } from '@ant-design/icons';

// Module account address
export const moduleAddress = "0x5e813ba3119157037e064b59853879ed4f232e69f2e980c108e61b97b72ad96f";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Define interfaces for TrainingRequest and TrainingRequests
interface TrainingRequest {
  trainer_address: string;
  provider_address: string;
  model_ipfs_link: string;
  dataset_ipfs_link: string;
  status: number;
}

interface TrainingRequestsData {
  requests: TrainingRequest[];
}

const PendingRequests: React.FC = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [pendingRequests, setPendingRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number | null>(null);
  const [modelIpfsLink, setModelIpfsLink] = useState<string>(''); // Capture model IPFS link
  const [weightsIpfsLink, setWeightsIpfsLink] = useState<string>(''); // Capture weights IPFS link

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: moduleAddress,
      });

      const trainingRequestsResource = resources.find(
        (res: any) => res.type === `${moduleAddress}::TrusTrain::TrainingRequests`
      );

      if (trainingRequestsResource && account?.address) {
        const requestsData = trainingRequestsResource.data as TrainingRequestsData;

        const pendingRequestsData = requestsData.requests
          .filter(request => request.status === 0 && request.provider_address === account.address)  // Only pending and for this provider
          .map(item => ({
            trainer_address: item.trainer_address,
            provider_address: item.provider_address,
            model_ipfs_link: item.model_ipfs_link,
            dataset_ipfs_link: item.dataset_ipfs_link,
            status: item.status,
          }));

        setPendingRequests(pendingRequestsData);
        message.success('Pending requests fetched successfully.');
      } else {
        message.warning('No pending training requests found.');
      }
    } catch (error: any) {
      console.error('Error fetching pending requests:', error);
      message.error('Failed to fetch pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [account]);

  // Handle request (accept/reject)
  const handleRequest = async (requestIndex: number, accept: boolean) => {
    if (accept) {
      // Show modal for model weights link input if accepted
      setSelectedRequestIndex(requestIndex);
      setIsModalVisible(true);
    } else {
      // Process the rejection directly
      try {
        const transaction: InputTransactionData = {
          data: {
            function: `${moduleAddress}::TrusTrain::handle_training_request`,
            functionArguments: [requestIndex.toString(), accept],  // Pass request_index and accept flag (true for accept, false for reject)
          }
        };

        const response = await signAndSubmitTransaction(transaction);
        await aptos.waitForTransaction({ transactionHash: response.hash });

        message.success("Request rejected and removed successfully!");
        // Refresh the pending requests to update the UI
        fetchPendingRequests();
      } catch (error: any) {
        message.error("Failed to process the request.");
        console.error("Error processing request:", error);
      }
    }
  };

  // Handle submission of model weights IPFS link
  const handleOk = async () => {
    if (!modelIpfsLink || !weightsIpfsLink) {
      message.warning('Please enter both IPFS links.');
      return;
    }

    try {
      // Call return_model_weights function
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::TrusTrain::return_model_weights`,
          functionArguments: [
             // Pass the selected request index
            weightsIpfsLink // Weights IPFS link entered by the provider
          ],
        }
      };

      setTransactionInProgress(true); // Show loading
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      message.success('Model weights returned successfully.');
      setIsModalVisible(false); // Close modal after success
      fetchPendingRequests(); // Refresh the list after accepting the request
    } catch (error: any) {
      message.error('Error returning model weights.');
      console.error('Error returning model weights:', error);
    } finally {
      setTransactionInProgress(false); // Hide loading
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle delete request
  const handleDeleteRequest = async (requestIndex: number) => {
    try {
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::TrusTrain::delete_request`,
          functionArguments: [requestIndex.toString()],
        }
      };

      setTransactionInProgress(true);
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      message.success('Request deleted successfully.');
      fetchPendingRequests(); // Refresh the list after deleting the request
    } catch (error: any) {
      message.error('Failed to delete request.');
      console.error('Error deleting request:', error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <div className="pending-requests">
      <Card title="Pending Training Requests" bordered={false} loading={loading}>
        {pendingRequests.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={pendingRequests}
            renderItem={(request, index) => (
              <List.Item key={index}>
                <Card bordered={true} style={{ marginBottom: '16px', position: 'relative' }}>
                  {/* Accept, Reject, and Delete Emojis */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <span
                      style={{ cursor: 'pointer', fontSize: '24px', marginRight: '10px' }}
                      onClick={() => handleRequest(index, true)}  // Accept request
                    >
                      ✅
                    </span>
                    <span
                      style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }}
                      onClick={() => handleRequest(index, false)}  // Reject request
                    >
                      ❌
                    </span>
                    <span
                      style={{ cursor: 'pointer', fontSize: '24px', color: 'red', marginLeft: '10px' }}
                      onClick={() => handleDeleteRequest(index)}  // Delete request
                    >
                      <DeleteOutlined />
                    </span>
                  </div>

                  <Descriptions title={`Request from Trainer: ${request.trainer_address}`} bordered>
                    <Descriptions.Item label="Trainer Address">{request.trainer_address}</Descriptions.Item>
                    <Descriptions.Item label="Model IPFS Link">
                      <Button
                        type="link"
                        href={request.model_ipfs_link}
                        target="_blank"
                        icon={<LinkOutlined />}
                      >
                        View Model
                      </Button>
                    </Descriptions.Item>
                    <Descriptions.Item label="Dataset IPFS Link">
                      <Button
                        type="link"
                        href={request.dataset_ipfs_link}
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
          <p>No pending requests found for this provider.</p>
        )}
      </Card>

      {/* Modal for submitting model weights IPFS links */}
      <Modal
        title="Submit Model Weights"
        visible={isModalVisible}
        onOk={handleOk} // Submit model weights
        onCancel={handleCancel} // Close modal
        confirmLoading={transactionInProgress} // Show loading when submitting
      >
        <Input
          placeholder="Weights IPFS \ cloud Link"
          value={weightsIpfsLink}
          onChange={(e) => setWeightsIpfsLink(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Model IPFS \ cloud Link"
          value={modelIpfsLink}
          onChange={(e) => setModelIpfsLink(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PendingRequests;
