import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import Mainmenu from "../components/MainSection";
;

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* Landing Page Sections */}
      <main>
        <Mainmenu />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sign Up Modal */}
      
    </div>
  );
};

export default Home;