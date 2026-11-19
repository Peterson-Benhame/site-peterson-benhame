import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Hero from './sections/Hero.jsx';
import Moment from './sections/Moment.jsx';
import Journey from './sections/Journey.jsx';
import About from './sections/About.jsx';
import Format from './sections/Format.jsx';
import FAQ from './sections/FAQ.jsx';
import Application from './sections/Application.jsx';
import { useSectionScroll } from './hooks/useSectionScroll.js';

export default function App() {
  useSectionScroll();

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Moment />
        <Journey />
        <About />
        <Format />
        <FAQ />
        <Application />
      </main>
      <Footer />
    </>
  );
}
