import React from 'react'
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

export default function Dashboard() {
  return (
    <div>
      return (
        <>
          <SideBar />
          <div style={{ marginLeft: '250px', padding: '20px' }}>
            <Outlet />
          </div>
        </>
      );
    </div>
  )
}
