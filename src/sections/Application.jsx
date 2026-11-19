import { useRef, useState } from 'react';
import { gsap, motionQuery, useGSAP } from '../animations/gsapSetup.js';
import { formConfig } from '../config/form.js';
import { sendApplication, validateApplication } from '../lib/applicationForm.js';
import { trackEvent } from '../lib/analytics.js';

const fieldNames = ['nome', 'email', 'startup', 'estagio', 'problema', 'objetivo'];

export default function Application() {
  const sectionRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: '', state: '' });
  const [sending, setSending] = useState(false);
  const statusRef = useRef(null);
  const startedRef = useRef(false);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: '.application-inner', start: 'top 78%', once: true },
      });
      timeline
        .from('.application-eyebrow', { opacity: 0, y: 25, duration: 0.55, ease: 'power2.out' })
        .from('.application-title-line', { opacity: 0, y: 48, duration: 0.8, stagger: 0.16, ease: 'power3.out' }, '-=0.25')
        .from('.application-copy-motion', { opacity: 0, y: 25, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '-=0.35')
        .from('.application-panel', { opacity: 0, y: 55, duration: 0.9, ease: 'power3.out', clearProps: 'opacity,transform' }, '-=0.72');
    });
    return () => media.revert();
  }, { scope: sectionRef });

  const clearError = (name) => {
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;

    if (!formConfig.enabled || !formConfig.endpoint) {
      setStatus({ message: 'O formulário ainda não está disponível. Escreva para mentoria@petersonbenhame.com.br.', state: 'error' });
      return;
    }

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data._honey) {
      setStatus({ message: 'Não foi possível enviar. Recarregue a página e tente novamente.', state: 'error' });
      return;
    }

    const nextErrors = validateApplication(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ message: 'Confira os campos destacados antes de enviar.', state: 'error' });
      form.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }

    setSending(true);
    setStatus({ message: 'Enviando sua candidatura…', state: 'sending' });
    try {
      await sendApplication(data, formConfig);
      trackEvent('application_submitted');
      form.reset();
      setStatus({ message: 'Candidatura enviada. Peterson analisará as informações e entrará em contato pelo e-mail informado.', state: 'success' });
      statusRef.current?.focus();
    } catch {
      setStatus({ message: 'Não foi possível confirmar o envio. Seus dados continuam preenchidos. Tente novamente ou escreva para mentoria@petersonbenhame.com.br.', state: 'error' });
    } finally {
      setSending(false);
    }
  };

  const fieldProps = (name) => ({
    'aria-describedby': `${name}-error`,
    'aria-invalid': errors[name] ? 'true' : undefined,
    onInput: () => clearError(name),
  });

  return (
    <section aria-labelledby="application-title" className="application" id="candidatura" ref={sectionRef}>
      <div className="application-inner">
        <div className="application-copy">
          <span className="application-eyebrow eyebrow">06 / VAMOS COMEÇAR PELO SEU CONTEXTO</span>
          <h2 id="application-title">
            <span className="application-title-line">O próximo passo</span>
            <span className="application-title-line">começa com</span>
            <span className="application-title-line"><em>uma conversa.</em></span>
          </h2>
          <p className="application-copy-motion">Conte o que você está construindo, o que já descobriu e onde precisa de orientação.</p>
          <div className="application-copy-motion application-next">
            <span aria-hidden="true">↗</span>
            <p>Sua candidatura será analisada.<br />O contato acontece pelo e-mail informado.</p>
          </div>
          <a className="application-copy-motion contact-email" href="mailto:mentoria@petersonbenhame.com.br">mentoria@petersonbenhame.com.br</a>
        </div>
        <form aria-busy={sending || undefined} aria-describedby="form-availability" className="application-panel" id="application-form" noValidate onFocusCapture={() => { if (!startedRef.current) { startedRef.current = true; trackEvent('application_start'); } }} onSubmit={handleSubmit}>
          <h3>Candidatura à mentoria</h3>
          <p className="form-lead">Primeiro, um pouco sobre você e sua ideia.</p>
          <p className="availability" hidden={formConfig.enabled && Boolean(formConfig.endpoint)} id="form-availability">
            O envio pelo formulário será disponibilizado em breve. Por enquanto, entre em contato pelo e-mail desta seção.
          </p>
          <div className="field-row">
            <div className="field">
              <label htmlFor="nome">Seu nome</label>
              <input autoComplete="name" id="nome" maxLength="100" name="nome" placeholder="Como você se chama?" required {...fieldProps('nome')} />
              <span className="field-error" id="nome-error">{errors.nome}</span>
            </div>
            <div className="field">
              <label htmlFor="email">Seu e-mail</label>
              <input autoComplete="email" id="email" maxLength="254" name="email" placeholder="voce@exemplo.com" required type="email" {...fieldProps('email')} />
              <span className="field-error" id="email-error">{errors.email}</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="startup">Sua startup ou ideia</label>
            <input id="startup" maxLength="300" name="startup" placeholder="Nome ou uma breve descrição" required {...fieldProps('startup')} />
            <span className="field-error" id="startup-error">{errors.startup}</span>
          </div>
          <div className="field">
            <label htmlFor="estagio">Em que estágio você está?</label>
            <select id="estagio" name="estagio" required {...fieldProps('estagio')}>
              <option value="">Selecione o momento atual</option>
              <option>Ideação</option><option>Validação</option><option>MVP</option>
            </select>
            <span className="field-error" id="estagio-error">{errors.estagio}</span>
          </div>
          <div className="field">
            <label htmlFor="problema">Qual problema você quer resolver e para quem?</label>
            <textarea id="problema" maxLength="1500" name="problema" placeholder="Conte sobre o problema e as pessoas que o enfrentam." required rows="3" {...fieldProps('problema')} />
            <span className="field-error" id="problema-error">{errors.problema}</span>
          </div>
          <div className="field">
            <label htmlFor="objetivo">Onde está a dificuldade e o que busca na mentoria?</label>
            <textarea id="objetivo" maxLength="1500" name="objetivo" placeholder="O que você precisa esclarecer para dar o próximo passo?" required rows="3" {...fieldProps('objetivo')} />
            <span className="field-error" id="objetivo-error">{errors.objetivo}</span>
          </div>
          <div aria-hidden="true" className="honeypot">
            <label htmlFor="website">Deixe em branco</label>
            <input autoComplete="off" id="website" name="_honey" tabIndex="-1" />
          </div>
          <p className="privacy-note">Suas informações serão usadas para analisar a candidatura e entrar em contato sobre a mentoria. <a href="/privacidade.html">Saiba como seus dados são tratados.</a></p>
          <button className="button submit-button" disabled={sending || !formConfig.enabled || !formConfig.endpoint} type="submit">
            Enviar candidatura <span aria-hidden="true">↗</span>
          </button>
          <p aria-live="polite" data-state={status.state || undefined} id="form-status" ref={statusRef} role="status" tabIndex="-1">{status.message}</p>
          <noscript><p>Para enviar sua candidatura, escreva para <a href="mailto:mentoria@petersonbenhame.com.br">mentoria@petersonbenhame.com.br</a>.</p></noscript>
        </form>
      </div>
    </section>
  );
}
