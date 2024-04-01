import SocialLinks from "./components/SocialLinks";
import Summary from "./components/Summary";
import Header from "./components/Header";

const Home = () => {
  return (
    <main className="pt-12 pb-20">
      <div className="text-center">
        <Header />
        <Summary />
        <SocialLinks />
      </div>
    </main>
  );
};

export default Home;
