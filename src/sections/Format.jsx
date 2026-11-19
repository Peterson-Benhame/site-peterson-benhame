import { useRef } from 'react';
import { gsap, motionQuery, useGSAP } from '../animations/gsapSetup.js';
import SectionLabel from '../components/SectionLabel.jsx';

const formatItems = [
  ['01 — ATENÇÃO', 'Uma startup por vez.', 'Encontros individuais, voltados ao seu contexto e às decisões que você precisa tomar.'],
  ['02 — RITMO', 'Seis encontros online.', 'Frequência semanal, com atividades práticas para desenvolver entre as sessões.'],
  ['03 — CONTINUIDADE', 'Aprendizado que orienta.', 'Os resultados das atividades ajudam a revisar hipóteses e definir os próximos passos.'],
];

export default function Format() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: '.format-grid', start: 'top 82%', once: true },
      });
      timeline
        .from('.format-item', {
          opacity: 0,
          y: 45,
          duration: 0.75,
          stagger: 0.15,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        })
        .from('.format-rule', {
          scaleX: 0,
          duration: 0.65,
          stagger: 0.15,
          ease: 'power2.out',
          transformOrigin: 'left center',
          clearProps: 'transform',
        }, 0.08);
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    <section aria-labelledby="format-title" className="section format" id="como-funciona" ref={sectionRef}>
      <SectionLabel index="04" label="COMO FUNCIONA" note="ESPAÇO PARA A SUA REALIDADE." />
      <h2 id="format-title">Individual no formato.<br /><em>Prática em cada etapa.</em></h2>
      <div className="format-grid">
        {formatItems.map(([label, title, description], index) => (
          <div className="format-item" key={label}>
            <span aria-hidden="true" className="format-rule" />
            <span>{label}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
