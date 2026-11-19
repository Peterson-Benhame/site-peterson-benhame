import { useRef } from 'react';
import { gsap, motionQuery, useGSAP } from '../animations/gsapSetup.js';
import SectionLabel from '../components/SectionLabel.jsx';

const stages = [
  {
    number: '01',
    icon: 'assets/img/ideia.png',
    title: 'Tenho uma ideia.',
    description: 'Delimitar o problema, entender quem o enfrenta e identificar o que ainda é uma hipótese.',
    question: 'O que vale investigar?',
  },
  {
    number: '02',
    icon: 'assets/img/validacao.png',
    title: 'Quero validar.',
    description: 'Conversar com o público, planejar experimentos e usar evidências para revisar a direção.',
    question: 'O que precisamos aprender?',
  },
  {
    number: '03',
    icon: 'assets/img/construir-mvp.png',
    title: 'Vou construir o MVP.',
    description: 'Recortar o essencial, avaliar escolhas técnicas e organizar os próximos passos do produto.',
    question: 'O que faz sentido construir?',
  },
];

export default function Moment() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      gsap.from('.stage', {
        opacity: 0,
        y: 45,
        duration: 0.75,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '.stage-grid',
          start: 'top 82%',
          once: true,
        },
      });
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    <section aria-labelledby="moment-title" className="section moment" id="seu-momento" ref={sectionRef}>
      <SectionLabel index="01" label="SEU MOMENTO" note="O PONTO DE PARTIDA É O SEU." />
      <div className="section-heading">
        <h2 id="moment-title">Você não precisa ter<br />todas as respostas.</h2>
        <p>Mas precisa saber quais perguntas fazer agora. A mentoria começa onde a sua startup está.</p>
      </div>
      <div className="stage-grid">
        {stages.map((stage, index) => (
          <article className="stage" key={stage.number}>
            <span className="stage-number">{stage.number}</span>
            <img alt="" className="stage-icon" decoding="async" height="40" src={stage.icon} width="40" />
            <h3>{stage.title}</h3>
            <p>{stage.description}</p>
            <span className="stage-question">
              {stage.question} <span aria-hidden="true">↗</span>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
