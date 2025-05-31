import { Outlet } from "react-router-dom";
import AnalyticsSidebar from "./AnalyticsSidebar";

const LayoutPage = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 260, position: "fixed", left: 0, top: 0, bottom: 0, background: "#fff", zIndex: 10 }}>
        <AnalyticsSidebar />
      </div>
      <main style={{ marginLeft: "260px", height:"100vh", flexGrow: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutPage;
