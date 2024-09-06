import React, { useEffect, useState } from 'react';
import { Card, message, Button } from 'antd';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import './ShareResources.css';

// change this to be your module account address
export const moduleAddress = "0x2ffd39e15b906d6c380046402d09de4a415e6e063fb03cb72ec16d2a030cec86";
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Define the TypeScript interface for ResourceProvider
interface ResourceProvider {
  address: string;
  cpu: number;
  gpu: number;
  is_external: boolean;
}

// Define the interface for ResourceProviders
interface ResourceProviders {
  providers: ResourceProvider[];
}

const ShareResources: React.FC = () => {
  const { account } = useWallet();
  const [registeredResources, setRegisteredResources] = useState<ResourceProvider[]>([]); // Store the fetched resources

  const fetchRegisteredResources = async () => {
    if (!account) {
      console.error("No connected wallet account.");
      message.error('No connected wallet account.');
      return;
    }

    try {
      // Fetch resources from the blockchain using the module address
      const resources = await aptos.getAccountResources({
        accountAddress: moduleAddress,
      });

      // Find the ResourceProviders resource
      const resourceProviders = resources.find(
        (res: any) => res.type === `${moduleAddress}::TrusTrain::ResourceProviders`
      );

      if (resourceProviders) {
        // Cast the data as ResourceProviders type to avoid the '{}' type issue
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

  return (
    <div className="share-resources">
      <Card title="Registered Resources" bordered={false}>
        <Button onClick={fetchRegisteredResources}>Fetch Registered Resources</Button>

        {registeredResources.length > 0 ? (
          <ul>
            {registeredResources.map((provider, index) => (
              <li key={index}>
                Address: {provider.address}, CPU: {provider.cpu}, GPU: {provider.gpu}, External: {provider.is_external ? 'Yes' : 'No'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No resources registered yet.</p>
        )}
      </Card>
    </div>
  );
};

export default ShareResources;
