const rules = { nome:[2,100], email:[5,254], startup:[3,300], estagio:[1,20], problema:[10,1500], objetivo:[10,1500] };
export function validateApplication(data) {
  const errors = {};
  for (const [key,[min,max]] of Object.entries(rules)) {
    const value = typeof data[key] === 'string' ? data[key].trim() : '';
    if (value.length < min || value.length > max) errors[key] = `Preencha entre ${min} e ${max} caracteres.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email?.trim() || '')) errors.email = 'Informe um e-mail válido.';
  if (!['Ideação','Validação','MVP'].includes(data.estagio)) errors.estagio = 'Selecione o estágio da sua startup.';
  return errors;
}
export async function sendApplication(data, { endpoint, fetcher = fetch, timeoutMs = 12000 } = {}) {
  if (Object.keys(validateApplication(data)).length) throw new Error('Revise os campos da candidatura.');
  if (!/^https:\/\/formsubmit\.co\/ajax\/[^/?#]+$/.test(endpoint || '')) throw new Error('O destino de envio não está configurado.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const fields = Object.fromEntries(Object.keys(rules).map(key => [key,data[key].trim()]));
    const response = await fetcher(endpoint, { method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'}, signal:controller.signal,
      body:JSON.stringify({...fields,_subject:'Nova candidatura à mentoria — Peterson Benhame',_template:'table',_honey:''}) });
    const body = await response.json();
    if (!response.ok || ![true,'true'].includes(body?.success)) throw new Error('O serviço não confirmou o envio.');
  } finally { clearTimeout(timer); }
}
if (typeof document !== 'undefined') {
  const form = document.querySelector('#application-form');
  if (form) {
    const config = window.PB_FORM || {};
    const status = document.querySelector('#form-status');
    const button = form.querySelector('button[type=submit]');
    const availability = document.querySelector('#form-availability');
    let sending = false;
    const setStatus = (message,state) => {status.textContent=message;status.dataset.state=state;};
    const clearError = field => {field.removeAttribute('aria-invalid');const error=document.getElementById(`${field.name}-error`);if(error)error.textContent='';};
    for (const key of Object.keys(rules)) {
      const field = form.elements.namedItem(key);
      field.setAttribute('aria-describedby',`${key}-error`);
      field.addEventListener('input',()=>clearError(field));
    }
    if (config.enabled && config.endpoint) {button.disabled=false;availability.hidden=true;}
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;
      if (!config.enabled || !config.endpoint) {setStatus('O formulário ainda não está disponível. Escreva para mentoria@petersonbenhame.com.br.','error');return;}
      if (form.elements.namedItem('_honey').value) {setStatus('Não foi possível enviar. Recarregue a página e tente novamente.','error');return;}
      const data=Object.fromEntries(new FormData(form));
      const errors=validateApplication(data);
      for(const key of Object.keys(rules))clearError(form.elements.namedItem(key));
      for(const [key,message] of Object.entries(errors)){form.elements.namedItem(key).setAttribute('aria-invalid','true');document.getElementById(`${key}-error`).textContent=message;}
      if(Object.keys(errors).length){setStatus('Confira os campos destacados antes de enviar.','error');form.elements.namedItem(Object.keys(errors)[0]).focus();return;}
      sending=true;button.disabled=true;form.setAttribute('aria-busy','true');setStatus('Enviando sua candidatura…','sending');
      try {
        await sendApplication(data,config);
        form.reset();setStatus('Candidatura enviada. Peterson analisará as informações e entrará em contato pelo e-mail informado.','success');status.focus();
      } catch {setStatus('Não foi possível confirmar o envio. Seus dados continuam preenchidos. Tente novamente ou escreva para mentoria@petersonbenhame.com.br.','error');}
      finally {sending=false;button.disabled=false;form.removeAttribute('aria-busy');}
    });
  }
}
