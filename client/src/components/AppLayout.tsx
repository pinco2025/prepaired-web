import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div
      id="app-layout-container"
      className="
        h-screen
        w-full
        overflow-y-auto
        overflow-x-hidden
        no-scrollbar
        scroll-momentum
      "
    >
      <Outlet />
    </div>
  );
};

export default AppLayout;
