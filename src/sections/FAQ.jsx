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

      gsap.timeline({
        scrollTrigger: { trigger: '.faq-cabinet', start: 'top 82%', once: true },
      })
        .from('.faq-cabinet', {
          opacity: 0,
          y: 42,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        })
        .from('.faq-card', {
          opacity: 0,
          y: 28,
          duration: 0.58,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        }, '-=0.45');

      const details = gsap.utils.toArray('.faq-card');
      const cleanups = details.map((detail) => {
        const summary = detail.querySelector('summary');
        const indicator = detail.querySelector('.faq-mark');
        const toggle = (event) => {
          event.preventDefault();
          if (gsap.isTweening(detail)) return;

          const opening = !detail.open;
          if (opening) {
            details.forEach((other) => {
              if (other !== detail && other.open) {
                other.open = false;
                gsap.set(other, { clearProps: 'height,overflow' });
                gsap.set(other.querySelector('.faq-mark'), { rotation: 0 });
              }
            });
          }

          const startHeight = summary.offsetHeight;
          if (opening) detail.open = true;
          const endHeight = opening ? detail.offsetHeight : summary.offsetHeight;

          gsap.set(detail, { height: startHeight, overflow: 'hidden' });
          gsap.fromTo(indicator,
            { rotation: opening ? 0 : 45 },
            { rotation: opening ? 45 : 0, duration: 0.35, ease: 'power2.out' });
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
      <div className="faq-cabinet">
        <div className="faq-cabinet-top" aria-hidden="true">
          <span>ÍNDICE DE DÚVIDAS</span>
          <span>05 ARQUIVOS</span>
        </div>
        <div className="faq-tray">
          {questions.map(([question, answer], index) => (
            <details className="faq-card" key={question} open={index === 0 ? true : undefined}>
              <summary>
                <span className="faq-tab" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="faq-question-number" aria-hidden="true">Q.{String(index + 1).padStart(2, '0')}</span>
                <span className="faq-question">{question}</span>
                <span aria-hidden="true" className="faq-mark" />
              </summary>
              <div className="faq-answer">
                <p>{answer}</p>
              </div>
            </details>
          ))}
        </div>
        <div className="faq-drawer-front" aria-hidden="true">
          <span className="faq-drawer-label">MENTORIA · PETERSON BENHAME</span>
          <span className="faq-pull"><i /></span>
          <span className="faq-drawer-code">FAQ / 05</span>
        </div>
      </div>
    </section>
  );
}
