import React, { useEffect, useState } from 'react';
import { message, notification, Modal, Button } from 'antd';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

// Module account address
export const moduleAddress = "0x5e813ba3119157037e064b59853879ed4f232e69f2e980c108e61b97b72ad96f";
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Define interfaces for TrainingRequest
interface TrainingRequest {
  trainer_address: string;
  provider_address: string;
  status: number;
  model_ipfs_link: string;
  dataset_ipfs_link: string;
  payment_amount: number;  // Payment amount for training
}

interface TrainingRequestsData {
  requests: TrainingRequest[];
}

const TrainerDashboard: React.FC = () => {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false); // Payment modal state
  const [paymentAmount, setPaymentAmount] = useState<number>(0); // Store payment amount
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null); // Store the provider for payment
  const { account, signAndSubmitTransaction } = useWallet();
  const [notificationKey, setNotificationKey] = useState<string | null>(null); // Track notification key

  // Fetch the training requests
  const fetchRequests = async () => {
    setLoading(true); // Set loading to true before fetching requests
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: moduleAddress, // Replace with your resource account address
      });

      const trainingRequestsResource = resources.find(
        (res: any) => res.type === `${moduleAddress}::TrusTrain::TrainingRequests`
      );

      if (trainingRequestsResource) {
        const requestsData = trainingRequestsResource.data as TrainingRequestsData;
        const pendingRequestsData = requestsData.requests; // Set the requests from trainingRequestsResource
        setRequests(pendingRequestsData); // Update the state with the pending requests

        // Check if any request has been updated to status 2 (Model weights submitted)
        pendingRequestsData.forEach((request) => {
          if (request.trainer_address === account?.address && request.status === 2) {
            // Show notification to the trainer when the status is 2
            const key = `payment_${Date.now()}`; // Unique key for the notification
            setNotificationKey(key);
            notification.info({
              message: "Model Weights Submitted",
              description: "The provider has submitted model weights. Please proceed with the payment.",
              duration: 50,  // Make notification non-closable
              onClick: () => handleNotificationClick(request.payment_amount, request.provider_address),
              key: key,  // Assign the unique key
              closeIcon: null // Disable close button
            });
          }
        });
      } else {
        message.warning("No training requests found.");
      }
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      message.error("Failed to fetch requests.");
    } finally {
      setLoading(false); // Set loading to false after requests are fetched
    }
  };

  useEffect(() => {
    if (account) {
      console.log("Account Address:", account.address); // Check if account address is available
      fetchRequests();
    }
  }, [account]);

  // Handle notification click (show the payment modal)
  const handleNotificationClick = (amount: number, providerAddress: string) => {
    setPaymentAmount(amount);
    setSelectedProvider(providerAddress);
    setIsPaymentModalVisible(true);
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedProvider || paymentAmount === 0) {
      message.error("Missing provider information or payment amount.");
      return;
    }

    try {
      // Construct the transaction object similar to `return_model_weights`
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::TrusTrain::pay_for_training`, // Your Move function
          functionArguments: [
            selectedProvider,            // Provider address (as string)
            2     // Payment amount (converted to string)
          ],
        }
      };

      // Sign and submit the transaction
      const response = await signAndSubmitTransaction(transaction);

      // Wait for the transaction to be confirmed
      await aptos.waitForTransaction({ transactionHash: response.hash });

      message.success('Payment successful!');
      setIsPaymentModalVisible(false); // Close the payment modal after success
      
      // Close the notification after payment
      
    } catch (error) {
      console.error('Payment failed:', error);
      message.error('Payment failed.');
    }
  };

  return (
    <div>
      {/* Payment Modal */}
      <Modal
        title="Complete Payment"
        visible={isPaymentModalVisible}
        onOk={handlePayment} // Handle payment
        onCancel={() => setIsPaymentModalVisible(false)} // Close modal
        
        cancelButtonProps={{ disabled: true }} // Disable cancel to force payment
      >
        <p>The payment amount is: 2 FLC</p>
        <Button type="primary" onClick={handlePayment}>Send Payment</Button>
      </Modal>

      {/* You can render the fetched requests here */}
    </div>
  );
};

export default TrainerDashboard;
