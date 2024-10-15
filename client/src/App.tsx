import React, { useState } from 'react';
import { Layout, Menu, Row, Col, Badge, Drawer, Button, message } from 'antd';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { MenuOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import './App.css'; // Import custom CSS
import RegisterResourceProvider from './RegisterResourceProvider';
import AllocateResource from './AllocateResource';
import LandingPage from './LandingPage';
import AboutUs from './aboutUs';
import Experts from './Experts';
import HandleRequests from './HandleRequests';
import DatasetMarketplace from './datasetMarketplace';

const { Header, Content, Footer } = Layout;

const restApiServer = 'https://fullnode.testnet.aptoslabs.com';
const resourceType = '0x1::coin::CoinStore<0x13f383467f9e0bbcd3d9df7ebc720d9273a2a64b97f1de00ca293f7eb0f03344::FLCoinv2::FLC>';

const App: React.FC = () => {
  const { account } = useWallet();  // Retrieve wallet account info using useWallet
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [flcBalance, setFlcBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const isWalletConnected = Boolean(account?.address);  // Check if the wallet is connected

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  // Function to fetch FLC balance
const fetchFLCBalance = async () => {
  if (!account || !account.address) {
    message.error('No wallet connected.');
    return;
  }

  setLoading(true);
  const resourceUrl = `${restApiServer}/v1/accounts/${account.address}/resource/${encodeURIComponent(resourceType)}`;

  try {
    const response = await fetch(resourceUrl);
    const data = await response.json();

    if (data && data.data && data.data.coin && data.data.coin.value) {
      const coinValue = data.data.coin.value;
      
      // Remove decimal adjustment (use raw coin value)
      const formattedValue = parseFloat(coinValue); // Use raw coinValue without dividing by 10^6

      setFlcBalance(formattedValue);
      message.success(`FLC Balance: ${formattedValue} FLC`);
    } else {
      message.warning('No FLC CoinStore found or balance is zero.');
    }
  } catch (error) {
    console.error('Error fetching CoinStore resource:', error);
    message.error('Failed to fetch FLC balance.');
  } finally {
    setLoading(false);
  }
};


  return (
    <Router>
      <Layout className="layout">
        <Header>
          <Row justify="space-between" align="middle">
            <Col xs={0} sm={0} md={0} lg={24}>
              <Menu theme="dark" mode="horizontal" selectable={false}>
                <Menu.Item key="wallet">
                  <Badge dot={isWalletConnected} color="green">
                    <WalletSelector />
                  </Badge>
                </Menu.Item>
                <Menu.Item key="home">
                  <Link to="/home">Home</Link>
                </Menu.Item>
                <Menu.Item key="register_resource">
                  <Link to="/register-resource">Register Resource</Link>
                </Menu.Item>
                <Menu.Item key="allocate">
                  <Link to="/allocate">Allocate here</Link>
                </Menu.Item>
                <Menu.Item key="handlerequests">
                  <Link to="/handlerequests">Train From Here</Link>
                </Menu.Item>
                <Menu.Item key="datasets">
                  <Link to="/datasetMarketplace">Access datasets</Link>
                </Menu.Item>
                <Menu.Item key="about">
                  <Link to="/about">About</Link>
                </Menu.Item>
                <Menu.Item key="team">
                  <Link to="/team">Team Members</Link>
                </Menu.Item>
                {/* Button to fetch FLC balance */}
                <Menu.Item key="flc_balance">
                  <Button
                    type="primary"
                    onClick={fetchFLCBalance}
                    loading={loading}
                    disabled={!isWalletConnected} // Disable button if wallet not connected
                  >
                    Check FLC Balance
                  </Button>
                </Menu.Item>
              </Menu>
            </Col>
            <Col xs={24} sm={24} md={24} lg={0}>
              <Button type="primary" icon={<MenuOutlined />} onClick={showDrawer} />
            </Col>
          </Row>
        </Header>

        {/* Drawer for smaller screens */}
        <Drawer
          title="Menu"
          placement="right"
          closable={true}
          onClose={closeDrawer}
          visible={isDrawerVisible}
        >
          <Menu mode="vertical" selectable={false}>
            <Menu.Item key="wallet">
              <Badge dot={isWalletConnected} color="green">
                <WalletSelector />
              </Badge>
            </Menu.Item>
            <Menu.Item key="home">
              <Link to="/home">Home</Link>
            </Menu.Item>
            <Menu.Item key="register_resource">
              <Link to="/register-resource">Register Resource</Link>
            </Menu.Item>
            <Menu.Item key="allocate">
              <Link to="/allocate">Allocate here</Link>
            </Menu.Item>
            <Menu.Item key="handlerequests">
              <Link to="/handlerequests">Train From Here</Link>
            </Menu.Item>
            <Menu.Item key="datasets">
              <Link to="/datasetMarketplace">Access datasets</Link>
            </Menu.Item>
            <Menu.Item key="about">
              <Link to="/about">About</Link>
            </Menu.Item>
            <Menu.Item key="team">
              <Link to="/team">Team Members</Link>
            </Menu.Item>
            {/* Drawer button to fetch FLC balance */}
            <Menu.Item key="flc_balance">
              <Button
                type="primary"
                onClick={fetchFLCBalance}
                loading={loading}
                disabled={!isWalletConnected}
              >
                Check FLC Balance
              </Button>
            </Menu.Item>
          </Menu>
        </Drawer>

        <Content>
          <div className="site-layout-content">
            <Routes>
              <Route path="/home" element={<LandingPage />} />
              <Route path="/register-resource" element={<RegisterResourceProvider />} />
              <Route path="/allocate" element={<AllocateResource />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/team" element={<Experts />} />
              <Route path="/handlerequests" element={<HandleRequests />} />
              <Route path="/datasetMarketplace" element={<DatasetMarketplace />} />
            </Routes>
            {/* Show FLC balance if available */}
           
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ©2024 TrusTrain
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
