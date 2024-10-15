# TrusTrain
# TrusTrain: Decentralized AI Model Training Platform
## Description
TrusTrain is a decentralized platform that allows AI model trainers to collaborate with resource providers. Trainers can upload their models and datasets and providers will train the models and return the weights in exchange for FLC tokens.
### Folders Description

1. **TrusTrain**:
   - This folder contains the core files responsible for integrating with the Aptos blockchain. It includes smart contract implementations and functions that allow trainers and resource providers to interact in a decentralized manner, securely exchanging models, datasets, and training weights. The blockchain logic ensures transparency and guarantees the correct flow of FLC token payments between trainers and providers.

2. **FLCoin**:
   - The **FLCoin** folder holds the code for the custom cryptocurrency used within the TrusTrain ecosystem. FLCoin (FLC) is a token used to facilitate payments between model trainers and resource providers. This folder contains the token's smart contract, minting logic, and the transactions associated with transferring FLC between participants on the platform.

3. **FL-model**:
   - This folder is dedicated to the machine learning models used in the federated learning process within TrusTrain. It includes:
     - **FD (Federated Model)**: The global model that aggregates the weights from multiple local models trained by clients. This model enables federated learning, ensuring that multiple clients can train on their datasets without sharing sensitive data, while still contributing to a global model.
     - **FedClient1** and **FedClient2**: These are local models that will be trained by resource providers (clients) who have shared their computing resources on the TrusTrain platform. After each training epoch, the clients will send their locally trained model weights to the model owner. The **FD** model will then aggregate these weights to update the global model.

4. **Client**:
   - The **Client** folder contains the frontend of the TrusTrain platform. It is built with React and includes various components that enable users to interact with the platform.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Demo](#demp)
- [Acknowledgements](#acknowledgements)

## Installation
### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/najeh012/TrusTrain-DApp.git

2. Navigate into the project directory:
   cd ~/TrusTrain-DApp 
   
3. Install dependencies:
   ```bash
    npm install
## Usage
To start the application:
    ```bash
     npm start
## Features
Decentralized AI Training: Trainers upload models, and resource providers perform the training using allocated hardware.
Federated Learning: The platform supports federated learning, allowing models to be trained across multiple devices without data sharing.
Secure Payments: Trainers pay resource providers with FLC tokens for training services.
Blockchain Integration (Aptos Blockchain): Ensures transparency, immutability, and trust using blockchain technology.
## Demo 

## Acknowledgements
We would like to thank the following projects, communities, and individuals for their support:

- [Aptos Labs](https://aptoslabs.com/) for providing the blockchain SDK and contributing to the development of the Aptos platform.
- The **Aptos engineers** for their continued effort in improving the Aptos ecosystem.
- The [Aptos Documentation](https://aptos.dev/) for providing comprehensive and helpful resources to developers.
- [Ant Design](https://ant.design/) for UI components that enhanced the user interface.
- [IPFS](https://ipfs.tech/) for decentralized file storage solutions.
### Explanation of the Sections:
1. **Title and Description:** The project title and a brief description of what the TrusTrain platform does.
2. **Table of Contents:** Helps users navigate to different parts of the README.
3. **Installation:** Step-by-step instructions to clone the project, install dependencies, and run the app.
4. **Usage:** Shows examples of how to interact with the platform, both from the command line and programmatically.
5. **Features:** Highlights the key features of the TrusTrain.
6. **Demo:** A demo section to describe how to run a demo of the project.
7. **Acknowledgements:** Credits for any resources, libraries, or inspiration used in the project.
