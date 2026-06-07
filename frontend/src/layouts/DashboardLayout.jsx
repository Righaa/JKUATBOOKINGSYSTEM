import { useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";

import Navbar from "./Navbar";

import PageHeader from "../components/common/PageHeader";

import { getPageTitle } from "../constants/pageTitles";



export default function DashboardLayout({ children }) {

  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);



  return (

    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main-wrap">

        <Navbar />

        <PageHeader title={pageTitle} />

        <main className="dashboard-content">{children}</main>

      </div>

    </div>

  );

}

