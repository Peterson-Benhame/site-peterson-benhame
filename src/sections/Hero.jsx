import { useRef } from 'react';
import { gsap, motionQuery, useGSAP } from '../animations/gsapSetup.js';
import { useCinemaHero } from '../hooks/useCinemaHero.js';
import heroPosterUrl from '../../assets/img/hero-poster.png';

export default function Hero() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const posterRef = useRef(null);
  const illustrationRef = useRef(null);
  const beatsRef = useRef(null);
  useCinemaHero({ heroRef, canvasRef, posterRef, illustrationRef, beatsRef });

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      const header = document.querySelector('.site-header');
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .from(header, { opacity: 0, y: -22, duration: 0.65 })
        .from('.edition', { opacity: 0, y: 18, duration: 0.5 }, '-=0.32')
        .from('.hero-title-line > span', { yPercent: 115, duration: 0.9, stagger: 0.15 }, '-=0.18')
        .from('.hero-highlight-line', { scaleX: 0, duration: 0.55, transformOrigin: 'left center', ease: 'power2.out' }, '-=0.38')
        .from('.hero-copy > p', { opacity: 0, y: 30, duration: 0.65 }, '-=0.28')
        .from('.hero-copy .primary', { opacity: 0, y: 32, duration: 0.65 }, '-=0.42')
        .from('.hero-meta', { opacity: 0, y: 18, duration: 0.5 }, '-=0.36')
        .from('.hero-art .orbital, .hero-art .art-label, .hero-art .art-caption', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.08,
        }, '-=0.7')
        .from('.hero-bottom', { opacity: 0, y: 18, duration: 0.55 }, '-=0.45');
    });
    return () => media.revert();
  }, { scope: heroRef });

  return (
    <section aria-labelledby="hero-title" className="hero" id="inicio" ref={heroRef}>
      <div className="hero-sticky">
        <div className="hero-topline">
          <span className="edition">IDEIA · VALIDAÇÃO · MVP</span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">
              <span className="hero-title-line"><span>Sua ideia merece</span></span>
              <span className="hero-title-line"><span>um próximo</span></span>
              <span className="hero-title-line"><span><em>passo claro.<span aria-hidden="true" className="hero-highlight-line" /></em></span></span>
            </h1>
            <p>Transforme perguntas em decisões de produto e tecnologia. Uma jornada individual para dar estrutura ao que você quer construir.</p>
            <a className="button primary" href="#candidatura">Candidatar-me à mentoria <span aria-hidden="true">↗</span></a>
            <span className="hero-meta">6 encontros <span>·</span> Online <span>·</span> Individual</span>
          </div>
          <div aria-hidden="true" className="hero-art">
            <div className="orbital orbital-one" />
            <div className="orbital orbital-two" />
            <div className="art-grid" />
            <svg className="structure" fill="none" ref={illustrationRef} viewBox="0 0 620 620">
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="top" x1="150" x2="450" y1="100" y2="400">
                  <stop stopColor="#9EC1BA" />
                  <stop offset="1" stopColor="#34554F" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="front" x1="260" x2="350" y1="250" y2="480">
                  <stop stopColor="#33564F" />
                  <stop offset="1" stopColor="#142B28" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="side" x1="280" x2="440" y1="220" y2="450">
                  <stop stopColor="#203D38" />
                  <stop offset="1" stopColor="#0C1B19" />
                </linearGradient>
                <radialGradient id="ambient">
                  <stop stopColor="#53D6C3" stopOpacity=".12" />
                  <stop offset="1" stopColor="#53D6C3" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="320" cy="335" fill="url(#ambient)" r="270" />
              <g stroke="#93C1BA" strokeOpacity=".14">
                <path d="M80 405 330 260 550 387 300 532Z" />
                <path d="M80 445 330 300 550 427 300 572Z" />
                <path d="M160 451V366M300 532V445M440 451V365" />
              </g>
              <g stroke="#A6D4C8" strokeWidth=".8">
                <path d="m191 315 125-72 125 72-125 72Z" fill="url(#top)" />
                <path d="m191 315 125 72v114l-125-72Z" fill="url(#front)" />
                <path d="m316 387 125-72v114l-125 72Z" fill="url(#side)" />
                <path d="m223 234 93-54 93 54-93 54Z" fill="url(#top)" />
                <path d="m223 234 93 54v71l-93-54Z" fill="url(#front)" />
                <path d="m316 288 93-54v71l-93 54Z" fill="url(#side)" />
                <path d="m262 153 54-31 54 31-54 31Z" fill="#A7CFC3" />
                <path d="m262 153 54 31v53l-54-31Z" fill="#4D8778" />
                <path d="m316 184 54-31v53l-54 31Z" fill="#244E43" />
              </g>
              <path d="m223 305 93 54 93-54M191 429l125 72 125-72" stroke="#53D6C3" strokeWidth="2" />
            </svg>
            <img alt="" id="cinema-poster" ref={posterRef} src={heroPosterUrl} />
            <canvas hidden id="cinema-canvas" ref={canvasRef} />
            <span className="art-label label-top">01 / HIPÓTESE</span>
            <span className="art-label label-middle">02 / CONEXÃO</span>
            <span className="art-label label-bottom">03 / ESTRUTURA</span>
            <div className="art-caption"><span className="cross">+</span>DA IDEIA À ESTRUTURA<span className="cross">+</span></div>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#seu-momento"><span aria-hidden="true">↓</span>EXPLORE A JORNADA</a>
          <span>Menos suposições. Mais clareza para decidir.</span>
        </div>
        <div className="cinema-beats" hidden ref={beatsRef}>
          <span className="active">Investigue o problema.</span>
          <span>Teste suas hipóteses.</span>
          <span>Defina o que construir.</span>
        </div>
      </div>
    </section>
  );
}
