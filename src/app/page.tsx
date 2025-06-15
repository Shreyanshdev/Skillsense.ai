import React from "react";
import LandingPage from "./landingpage/page";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      {/* Landing Page Sections */}
        <LandingPage />
    </div>
  );
};

export default Home;