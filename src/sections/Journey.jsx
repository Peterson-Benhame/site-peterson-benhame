import { useRef } from 'react';
import { gsap, motionQuery, useGSAP } from '../animations/gsapSetup.js';
import SectionLabel from '../components/SectionLabel.jsx';

const meetings = [
  {
    number: '01', title: 'Diagnóstico', subtitle: 'ENTENDER O PONTO DE PARTIDA',
    description: 'Entender sua ideia, seu contexto e as decisões que estão impedindo o avanço.',
    deliverable: 'Mapa das principais hipóteses.',
  },
  {
    number: '02', title: 'Público', subtitle: 'ENCONTRAR AS PERGUNTAS CERTAS',
    description: 'Delimitar quem enfrenta o problema e preparar conversas que gerem aprendizado.',
    deliverable: 'Perfil inicial de cliente e roteiro de entrevistas.',
  },
  {
    number: '03', title: 'Evidências', subtitle: 'CONFRONTAR IDEIAS COM A REALIDADE',
    description: 'Analisar as conversas e experimentos, inclusive quando as respostas contrariam a ideia inicial.',
    deliverable: 'Hipóteses revisadas e próximos testes.',
  },
  {
    number: '04', title: 'Solução', subtitle: 'DAR FORMA AO QUE SERÁ TESTADO',
    description: 'Definir a proposta de valor e planejar uma maneira simples de colocá-la à prova.',
    deliverable: 'Protótipo ou experimento planejado.',
  },
  {
    number: '05', title: 'MVP', subtitle: 'ESCOLHER O ESSENCIAL',
    description: 'Priorizar funcionalidades, avaliar alternativas técnicas e discutir onde IA pode fazer sentido.',
    deliverable: 'Escopo inicial e decisões de tecnologia.',
  },
  {
    number: '06', title: 'Execução', subtitle: 'ORGANIZAR O PRÓXIMO CICLO',
    description: 'Conectar prioridades a ações e definir como acompanhar os aprendizados do produto.',
    deliverable: 'Plano de execução e métricas de aprendizado.',
  },
];

export default function Journey() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      gsap.from('.journey-intro-motion', {
        opacity: 0,
        y: 42,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: '.journey-layout', start: 'top 78%', once: true },
      });

      const steps = gsap.utils.toArray('.journey-steps details');
      const updateSteps = (progress) => {
        const activeIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
        steps.forEach((step, index) => {
          step.classList.toggle('is-active', index === activeIndex);
          step.classList.toggle('is-past', index < activeIndex);
        });
      };

      gsap.fromTo('.journey-progress-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: '.journey-steps',
            start: 'top 68%',
            end: 'bottom 62%',
            scrub: 0.55,
            onUpdate: ({ progress }) => updateSteps(progress),
            onLeave: () => updateSteps(1),
            onLeaveBack: () => updateSteps(0),
          },
        });
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    <section aria-labelledby="journey-title" className="section journey" id="jornada" ref={sectionRef}>
      <SectionLabel index="02" label="A JORNADA" note="SEIS ENCONTROS. UM CONTEXTO: O SEU." />
      <div className="journey-layout">
        <div className="journey-intro">
          <h2 className="journey-intro-motion" id="journey-title">Da pergunta<br />ao próximo<br /><em>passo.</em></h2>
          <p className="journey-intro-motion">Um percurso para transformar o que você aprende em decisões. A profundidade de cada etapa acompanha o momento da sua startup.</p>
          <a className="text-link" href="#candidatura">Quero conversar sobre minha startup <span aria-hidden="true">↗</span></a>
          <div className="journey-note">
            <span aria-hidden="true">↳</span>
            <p>Você coloca as atividades em prática.<br />Eu ajudo a questionar, priorizar e revisar.</p>
          </div>
        </div>
        <div className="journey-steps">
          <div aria-hidden="true" className="journey-progress"><span className="journey-progress-fill" /></div>
          {meetings.map((meeting, index) => (
            <details key={meeting.number} open={index === 0 ? true : undefined}>
              <summary>
                <span className="step-index">{meeting.number}</span>
                <span>{meeting.title}<small>{meeting.subtitle}</small></span>
                <span aria-hidden="true" className="detail-plus" />
              </summary>
              <div className="step-content">
                <p>{meeting.description}</p>
                <span>SAÍDA DO ENCONTRO</span>
                <p className="deliverable">{meeting.deliverable}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
