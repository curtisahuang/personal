import Summary from "./components/Summary";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Home = () => {
  return (
    <main className="pt-16">
      <div className="text-center">
        <div className="min-h-screen">
          <Header />
          <Summary />
        </div>
        <Footer />
      </div>
    </main>
  );
};

export default Home;
