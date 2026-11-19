import { useRef } from 'react';
import { desktopMotionQuery, gsap, motionQuery, ScrollTrigger, useGSAP } from '../animations/gsapSetup.js';
import SectionLabel from '../components/SectionLabel.jsx';

const expertise = ['Arquitetura de software', 'Desenvolvimento de produtos', 'IA aplicada'];

export default function About() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: '.about-layout', start: 'top 78%', once: true },
      });
      timeline
        .fromTo('.identity-curtain', { scaleY: 1 }, { scaleY: 0, duration: 1.05, ease: 'power3.inOut', transformOrigin: 'top center' })
        .from('.identity-photo', { yPercent: 5, scale: 1.025, duration: 1.1, ease: 'power3.out', clearProps: 'transform' }, 0)
        .from('.about-title-motion', { opacity: 0, y: 48, duration: 0.85, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.18)
        .from('.about-info-motion', { opacity: 0, y: 24, duration: 0.65, stagger: 0.1, ease: 'power2.out', clearProps: 'opacity,transform' }, 0.45);
    });
    media.add(desktopMotionQuery, () => {
      gsap.to('.identity-photo-frame', {
        yPercent: -3,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about-layout',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    <section aria-labelledby="about-title" className="section about" id="sobre" ref={sectionRef}>
      <SectionLabel index="03" label="QUEM CAMINHA COM VOCÊ" note="TECNOLOGIA ENCONTRA PRODUTO." />
      <div className="about-layout">
        <div className="identity-panel">
          <div className="identity-photo-frame">
            <img alt="Retrato de Peterson Benhame" className="identity-photo" decoding="async" loading="lazy" onLoad={() => ScrollTrigger.refresh()} src="assets/img/section-sobre.webp" />
          </div>
          <span aria-hidden="true" className="identity-curtain" />
          <span className="identity-top">PETERSON BENHAME<br />SOFTWARE · PRODUTO · IA</span>
          <div className="identity-bottom">
            <span>VISÃO DE PRODUTO.<br />CRITÉRIO TÉCNICO.</span>
            <span>+</span>
          </div>
        </div>
        <div className="about-copy">
          <span className="about-info-motion eyebrow">PRAZER, PETERSON.</span>
          <h2 className="about-title-motion" id="about-title">Experiência de quem<br />também já esteve<br /><em>na construção.</em></h2>
          <p className="about-info-motion">Sou desenvolvedor de software sênior, com experiência em arquitetura, inteligência artificial e sistemas corporativos.</p>
          <p className="about-info-motion">Como fundador e CTO da Psicosociall/Psicoffice, atuei na estratégia do produto, no desenvolvimento e na infraestrutura. Essa vivência conecta as conversas de negócio às escolhas técnicas da mentoria.</p>
          <div className="expertise">
            {expertise.map((item) => <span className="about-info-motion" key={item}>{item}</span>)}
          </div>
          <a className="about-info-motion text-link" href="https://www.linkedin.com/in/peterson-benhame-a9a1b6b5/" rel="noopener noreferrer" target="_blank">
            Conheça minha trajetória no LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
