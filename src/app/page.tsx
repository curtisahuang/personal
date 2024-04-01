import Summary from "./components/Summary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SideSlogan from "./components/SideSlogan";

const Home = () => {
  return (
    <main className="pt-16">
      <div className="text-center">
        <div className="min-h-screen">
          <span className="hidden md:block">
            <SideSlogan />
          </span>
          <Header />
          <Summary />
        </div>
        <Footer />
      </div>
    </main>
  );
};

export default Home;
