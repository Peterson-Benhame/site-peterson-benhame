const rules = {
  nome: [2, 100],
  email: [5, 254],
  startup: [3, 300],
  estagio: [1, 20],
  problema: [10, 1500],
  objetivo: [10, 1500],
};

export function validateApplication(data) {
  const errors = {};

  for (const [key, [min, max]] of Object.entries(rules)) {
    const value = typeof data[key] === 'string' ? data[key].trim() : '';
    if (value.length < min || value.length > max) {
      errors[key] = `Preencha entre ${min} e ${max} caracteres.`;
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email?.trim() || '')) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!['Ideação', 'Validação', 'MVP'].includes(data.estagio)) {
    errors.estagio = 'Selecione o estágio da sua startup.';
  }

  return errors;
}

export async function sendApplication(
  data,
  { endpoint, fetcher = fetch, timeoutMs = 12000 } = {},
) {
  if (Object.keys(validateApplication(data)).length) {
    throw new Error('Revise os campos da candidatura.');
  }

  if (!/^https:\/\/formsubmit\.co\/ajax\/[^/?#]+$/.test(endpoint || '')) {
    throw new Error('O destino de envio não está configurado.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fields = Object.fromEntries(
      Object.keys(rules).map((key) => [key, data[key].trim()]),
    );
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        ...fields,
        _subject: 'Nova candidatura à mentoria — Peterson Benhame',
        _template: 'table',
        _honey: '',
      }),
    });
    const body = await response.json();

    if (!response.ok || ![true, 'true'].includes(body?.success)) {
      throw new Error('O serviço não confirmou o envio.');
    }
  } finally {
    clearTimeout(timer);
  }
}
