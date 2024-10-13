import React, { useEffect, useState } from 'react';
import { Card, message, List, Button, Descriptions } from 'antd';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { LinkOutlined } from '@ant-design/icons';

// Module account address
export const moduleAddress = "0xcb2f626b41f47f250262619e734dcddfe66c59a7312548578b44a278def5921a";

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
    try {
      const transaction : InputTransactionData = {
        data :{
          function: `${moduleAddress}::TrusTrain::handle_training_request`,
          functionArguments: [requestIndex.toString(), accept],  // Pass request_index and accept flag (true for accept, false for reject)
        }
      };

      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      if (accept) {
        message.success("Request accepted successfully!");
      } else {
        message.success("Request rejected and removed successfully!");
      }

      // Refresh the pending requests to update the UI
      fetchPendingRequests();

    } catch (error: any) {
      message.error("Failed to process the request.");
      console.error("Error processing request:", error);
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
                  {/* Accept and Reject Emojis */}
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
    </div>
  );
};

export default PendingRequests;
