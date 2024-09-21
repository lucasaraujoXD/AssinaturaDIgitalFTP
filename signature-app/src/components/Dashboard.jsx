import React, { useState } from 'react';
import styled from 'styled-components';
import UploadDocument from './UploadDocument';
import SignaturePad from './SignaturePad';
import Sidebar from './Sidebar';

const Container = styled.div`
  padding: 20px;
  position: relative;
`;

const Dashboard = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <Container>
      <Sidebar visible={sidebarVisible} onToggle={toggleSidebar} user={user} />
      <h2>Dashboard</h2>
      
      <UploadDocument />
      <SignaturePad />
    </Container>
  );
};

export default Dashboard;
