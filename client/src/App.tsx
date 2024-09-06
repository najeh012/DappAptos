import React, { useState } from 'react';
import { Layout, Menu, Row, Col, Badge, Drawer, Button } from 'antd';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { MenuOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import './App.css'; // Import custom CSS
import RegisterResourceProvider from './RegisterResourceProvider';
import AllocateResource from './AllocateResource';
import LandingPage from './LandingPage';
import AboutUs from './aboutUs';
import Experts from './Experts';
const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const isWalletConnected = true;

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
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
                <Menu.Item key="about">
                  <Link to="/about">About</Link>
                </Menu.Item>
                <Menu.Item key="team">
                  <Link to="/team">Team Members</Link>
                </Menu.Item>
              </Menu>
            </Col>
            <Col xs={24} sm={24} md={24} lg={0}>
              <Button type="primary" icon={<MenuOutlined />} onClick={showDrawer} />
            </Col>
          </Row>
        </Header>
        
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
            <Menu.Item key="about">
              <Link to="/about">About</Link>
            </Menu.Item>
            <Menu.Item key="team">
              <Link to="/team">Team Members</Link>
            </Menu.Item>
          </Menu>
        </Drawer>
        <Content >
          <div className="site-layout-content">
            
            <Routes>
              <Route path="/home" element={<LandingPage/>} />
              <Route path="/register-resource" element={<RegisterResourceProvider />} />
              <Route path="/allocate" element={<AllocateResource />} />
              <Route path="/about" element={<AboutUs/>} />
              <Route path="/team" element={<Experts/>} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ©2024 Your Company Name
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
