import { useRef } from 'react';
import { gsap, motionQuery, useGSAP } from '../animations/gsapSetup.js';

const questions = [
  ['Preciso já ter uma empresa ou um MVP?', 'Não. A jornada atende desde a ideação até a validação e a definição de MVP. A candidatura ajuda a entender o seu momento e avaliar o encaixe da mentoria.'],
  ['Preciso saber programar?', 'Não é um pré-requisito. As decisões técnicas serão discutidas no contexto do produto e do negócio, de acordo com a sua experiência.'],
  ['Você vai desenvolver o meu produto?', 'A jornada é de mentoria: orientação, análise e revisão. Ela não inclui a execução integral do desenvolvimento do produto. Você ou sua equipe colocam as atividades em prática.'],
  ['Minha ideia estará validada ao final?', 'A validação depende das evidências dos testes e das respostas do mercado. A mentoria ajuda a planejar e interpretar esse processo; não garante vendas, investimento ou sucesso comercial.'],
  ['O que acontece depois da candidatura?', 'Peterson analisa o contexto e entra em contato pelo e-mail informado para conversar sobre a mentoria. O envio não representa contratação nem aprovação automática.'],
];

export default function FAQ() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      gsap.from('.faq-intro-motion', {
        opacity: 0,
        y: 38,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: '.faq-intro', start: 'top 80%', once: true },
      });

      const details = gsap.utils.toArray('.faq-list details');
      const cleanups = details.map((detail) => {
        const summary = detail.querySelector('summary');
        const indicator = detail.querySelector('.detail-plus');
        const toggle = (event) => {
          event.preventDefault();
          if (gsap.isTweening(detail)) return;

          const opening = !detail.open;
          const startHeight = detail.offsetHeight;
          if (opening) detail.open = true;
          const endHeight = opening ? detail.offsetHeight : summary.offsetHeight;

          gsap.set(detail, { height: startHeight, overflow: 'hidden' });
          gsap.to(indicator, { rotation: opening ? 45 : 0, duration: 0.35, ease: 'power2.out' });
          gsap.to(detail, {
            height: endHeight,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => {
              if (!opening) detail.open = false;
              gsap.set(detail, { clearProps: 'height,overflow' });
            },
          });
        };
        summary.addEventListener('click', toggle);
        return () => {
          summary.removeEventListener('click', toggle);
          gsap.killTweensOf([detail, indicator]);
        };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    <section aria-labelledby="faq-title" className="section faq" id="duvidas" ref={sectionRef}>
      <div className="faq-intro">
        <span className="eyebrow faq-intro-motion">05 / PERGUNTAS FREQUENTES</span>
        <h2 className="faq-intro-motion" id="faq-title">Antes do<br />próximo passo.</h2>
        <p className="faq-intro-motion">Clareza também sobre o que esperar da mentoria.</p>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}<span aria-hidden="true" className="detail-plus" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
