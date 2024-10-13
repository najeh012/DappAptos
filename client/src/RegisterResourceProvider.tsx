import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Input, Button, Select, Card, message, Checkbox } from 'antd';
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
export const moduleAddress = "0xcb2f626b41f47f250262619e734dcddfe66c59a7312548578b44a278def5921a";
export const moduleAddress1 = "0x13f383467f9e0bbcd3d9df7ebc720d9273a2a64b97f1de00ca293f7eb0f03344";


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
  const [formType, setFormType] = useState<string>('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [datasetLink, setDatasetLink] = useState('');
  const[storageType, setStorageType] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number | null>(null);

  const[storageCapacity, setStorageCapacity] = useState(0);
  const cpuOptions = [
    { label: 'Intel i5 11th Gen', value: 'intel-i5-11th' },
    { label: 'Intel i7 11th Gen', value: 'intel-i7-11th' },
    { label: 'Intel i9 10th Gen', value: 'intel-i9-10th' },
    { label: 'AMD Ryzen 5 5600X', value: 'amd-ryzen-5-5600x' },
    { label: 'AMD Ryzen 7 5800X', value: 'amd-ryzen-7-5800x' },
    { label: 'Intel Xeon W-2295', value: 'intel-xeon-w-2295' },
    { label: 'Apple M1', value: 'apple-m1' },
    { label: 'Apple M2', value: 'apple-m2' },
    
  ];
  
  const gpuOptions = [
    { label: 'NVIDIA RTX 3080', value: 'nvidia-rtx-3080' },
    { label: 'AMD Radeon RX 6800', value: 'amd-radeon-rx-6800' },
    { label: 'NVIDIA RTX 3090', value: 'nvidia-rtx-3090' },
    { label: 'NVIDIA RTX 3070', value: 'nvidia-rtx-3070' },
    { label: 'AMD Radeon RX 6900 XT', value: 'amd-radeon-rx-6900-xt' },
    { label: 'NVIDIA Quadro RTX 8000', value: 'nvidia-quadro-rtx-8000' },
    { label: 'Intel Iris Xe', value: 'intel-iris-xe' },
    { label: 'Apple M1 GPU', value: 'apple-m1-gpu' },
    
  ];
  
  
const[cpu, setCpu] = useState('');
const[gpu, setGpu] = useState('');
  const handleResourceCategoryChange = (value: string) => {
    setResourceCategory(value);
  };
  const handleSubmit = async (values: any) => {
    if (!account) {
      console.error("No connected wallet account.");
      message.error('No connected wallet account.');
      return;
    }
  
    let transaction: InputTransactionData;
  
    // Check the selected resource category and set the transaction data accordingly
    if (resourceCategory === 'computing') {
      // If the category is 'computing', call the 'register_resources' function
      transaction = {
        data: {
          function: `${moduleAddress}::TrusTrain::register_resources`,
          functionArguments:[
            cpu.toString(),
            gpu.toString(),
            storageCapacity.toString(),
            storageType.toString(),
            ram.toString(),
            true // Assuming 'availableTime' is an argument for the function
          ],
          // Add type arguments if your function requires them
        }
      };
    } else if (resourceCategory === 'dataset') {
      // If the category is 'dataset', call the 'share_dataset' function
      transaction = {
        data: {
          function: `${moduleAddress}::TrusTrain::shareDataset`,
          functionArguments:[
            datasetDescription.toString(),
            datasetLink,
            isFree.toString(),  // Sending the 'free' status as a string
            price?.toString() || '0',
          ],
          // Add type arguments if your function requires them
        }
      };
    } else {
      console.error("Invalid resource category.");
      message.error('Invalid resource category.');
      return;
    }
  
    setTransactionInProgress(true);
    try {
      // Sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // Wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });
      message.success(`${resourceCategory.charAt(0).toUpperCase() + resourceCategory.slice(1)} shared successfully.`);
    } catch (error: any) {
      console.error(error);
      message.error(`Failed to share ${resourceCategory}.`);
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
        function: `${moduleAddress1}::FLCoinv2::register_coin`, // Replace with your actual module and function
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
        <Form onFinish={handleSubmit} layout="vertical">
      {/* Select resource category */}
      <Form.Item label="Select Resource Category">
        <Select defaultValue={resourceCategory} onChange={handleResourceCategoryChange}>
          <Option value="computing">Computing</Option>
          <Option value="dataset">Dataset</Option>
        </Select>
      </Form.Item>

      {/* Conditionally render form based on selected category */}
      {resourceCategory === 'computing' && (
        <>
           <Form.Item label="CPU" name="cpu">
          <Select
            placeholder="Select a CPU"
            onChange={(value) => setCpu(value)}
          >
            {cpuOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="GPU" name="gpu">
          <Select
            placeholder="Select a GPU"
            onChange={(value) => setGpu(value)}
          >
            {gpuOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Storage Type" name="storageType">
      <Select
        placeholder="Select Storage Type"
        onChange={(value) => setStorageType(value)}
      >
        <Option value="ssd">SSD</Option>
        <Option value="hdd">HDD</Option>
      </Select>
    </Form.Item>
    <Form.Item label="RAM (GB)" name="ram">
      <InputNumber
        min={1}
        onChange={(value) => setRam(value || 0)}
      />
    </Form.Item>
    
<Form.Item label="Storage Capacity (GB)" name="storageCapacity">
  <InputNumber
    min={1}
    formatter={(value) => `${value} GB`}
    
    parser={(value) => value ? parseInt(value.replace(' GB', ''), 10) as unknown as 1 : 0 as unknown as 1}
    onChange={(value) => setStorageCapacity(value || 0)}
  />
</Form.Item>
        </>
      )}

      {resourceCategory === 'dataset' && (
        <>
          <Form.Item label="Dataset IPFS Link" name="datasetLink">
            <Input value={datasetLink} onChange={(e) => setDatasetLink(e.target.value)} placeholder="Enter dataset IPFS link" />
          </Form.Item>
          <Form.Item label="Dataset Description" name="datasetDescription">
          <Input.TextArea value={datasetDescription} onChange={(e) => setDatasetDescription(e.target.value)} placeholder="Enter dataset description" />
          </Form.Item>
          {/* Checkbox for free dataset */}
          <Form.Item label="Is this dataset free?">
            <Checkbox checked={isFree} onChange={(e) => setIsFree(e.target.checked)}>Free</Checkbox>
          </Form.Item>

              {/* If the dataset is not free, show the price input */}
              {!isFree && (
                <Form.Item label="Price (FLC)" name="price" rules={[{ required: true, message: 'Please enter the price' }]}>
                  <InputNumber min={0} value={price || 0} onChange={(value) => setPrice(value)} placeholder="Enter price in FLC" />
                </Form.Item>
              )}
        </>
      )}

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={transactionInProgress}>
          Share {resourceCategory}
        </Button>
      </Form.Item>
    </Form>
      </Card>

    

     
      
      <button onClick={coinstore} disabled={transactionInProgress}>Make coin store</button>
    </div>
  );
};

export default ShareResources;
