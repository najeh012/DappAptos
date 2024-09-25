import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Input, Button, Select, Card, message } from 'antd';
import { AptosClient } from 'aptos';
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
 
import {
    Account,
    Aptos,
    AptosConfig,
    Network,
} from "@aptos-labs/ts-sdk";
import './ShareResources.css';

const { TextArea } = Input;
const { Option } = Select;

// change this to be your module account address
export const moduleAddress = "0xba910884da53913141fdfa5402d9eb75ef3822183be3c38611e0f732b13ec3e3";


const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);
const ShareResources: React.FC = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [resourceCategory, setResourceCategory] = useState('computing');
  const [resourceType, setResourceType] = useState('gpu');
  const [ram, setRam] = useState(0);
  const [cache, setCache] = useState(0);
  const [availableTime, setAvailableTime] = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  

  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account) {
      console.error("No connected wallet account.");
      message.error('No connected wallet account.');
      return;
    }
     /////////////////////////////////////////////////
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::TrusTrain::register_resources`, // Replace with your actual module and function
        functionArguments: [
          ram.toString(),
          cache.toString(),
          true.toString(),
        ]
        // Add type arguments if your function requires them
      }
    };
    setTransactionInProgress(true);
    try {
      // Sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // Wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      message.success("Resource shared successfully.");
    } catch (error: any) {
      console.error(error + "gggggg");
      message.error("Failed to share resource.");
    } finally {
      setTransactionInProgress(false);
    }
  };

  const sendAptos = async () => {
    if (!account) {
      console.error("No connected wallet account.");
      message.error('No connected wallet account.');
      return;
    }

    const transaction1: InputTransactionData = {
      data: {
        function: `${moduleAddress}::TrusTrain::send_one_apt`, // Replace with your actual module and function
        functionArguments: [
          receiverAddress.toString(),
        ]
        // Add type arguments if your function requires them
      }
    };

    setTransactionInProgress(true);

    try {
      // Sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction1);
      // Wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      message.success("1 APT sent successfully.");
    } catch (error: any) {
      console.error(error + "gggggg");
      message.error("Failed to send 1 APT.");
    } finally {
      setTransactionInProgress(false);
    }
  }

  const coinstore = async () => {
    
    if (!account) {
      console.error("No connected wallet account.");
      message.error('No connected wallet account.');
      return;
    }

    const transaction2: InputTransactionData = {
      data: {
        function: `${moduleAddress}::TrusTrain::register_aptos_coin_store`, // Replace with your actual module and function
        functionArguments: [
        ]
        // Add type arguments if your function requires them
      }
    };

    setTransactionInProgress(true);

    try {
      // Sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction2);
      // Wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      message.success("coin store seted successfully.");
    } catch (error: any) {
      console.error(error + "gggggg");
      message.error("Failed .");
    } finally {
      setTransactionInProgress(false);
    }
  }
  
  ;

  return (
    <div className="share-resources">
      <Card title="Share Your Resources" bordered={false}>
        <p>
          Fill out the form below to share your computing resources or datasets. Ensure that all information is accurate to help users find and utilize your resources effectively.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="resource-category">Resource Category:</label>
            <select id="resource-category" name="resource-category" value={resourceCategory} onChange={(e) => setResourceCategory(e.target.value)}>
              <option value="computing">Computing</option>
              <option value="dataset">Dataset</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="resource-type">Resource Type:</label>
            <select id="resource-type" name="resource-type" value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
              <option value="gpu">GPU</option>
              <option value="cpu">CPU</option>
              <option value="ram">RAM</option>
              <option value="storage">Google Collab</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="ram">RAM (in GB):</label>
            <input type="number" id="ram" name="ram" value={ram} onChange={(e) => setRam(Number(e.target.value))} placeholder="Enter Amount of RAM" />
          </div>
          <div className="form-group">
            <label htmlFor="cache">Cache (in GB):</label>
            <input type="number" id="cache" name="cache" value={cache} onChange={(e) => setCache(Number(e.target.value))} placeholder="Enter Amount of Cache" />
          </div>
          <div className="form-group">
            <label htmlFor="available-time">Available Time (in hours per week):</label>
            <input type="number" id="available-time" name="available-time" value={availableTime} onChange={(e) => setAvailableTime(Number(e.target.value))} placeholder="Enter Available Time" />
          </div>
          <div className="form-group">
            <label htmlFor="additional-info">Additional Information:</label>
            <textarea id="additional-info" name="additional-info" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Provide any additional details or notes here"></textarea>
          </div>
          <button type="submit" disabled={transactionInProgress}>Share Resource</button>
        </form>
      </Card>

      <input
        type="text"
        value={receiverAddress}
        onChange={(e) => setReceiverAddress(e.target.value)} // Add this line to capture the receiver address input
        placeholder="Receiver Address"
      />
      
      <button onClick={sendAptos} disabled={transactionInProgress}>Send 1 APT</button>

     
      
      <button onClick={coinstore} disabled={transactionInProgress}>Make coin store</button>
    </div>
  );
};

export default ShareResources;
