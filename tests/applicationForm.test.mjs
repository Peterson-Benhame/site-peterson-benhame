import assert from 'node:assert/strict';
import test from 'node:test';
import { formConfig } from '../src/config/form.js';
import { sendApplication, validateApplication } from '../src/lib/applicationForm.js';

const validData = {
  nome: 'Peterson Benhame',
  email: 'peterson@example.com',
  startup: 'Produto em validação',
  estagio: 'Validação',
  problema: 'Entender melhor o problema do público.',
  objetivo: 'Definir as próximas evidências necessárias.',
};

test('accepts a complete valid application', () => {
  assert.deepEqual(validateApplication(validData), {});
});

test('reports required lengths, email and stage errors', () => {
  const errors = validateApplication({
    nome: ' ',
    email: 'inválido',
    startup: 'x',
    estagio: 'Crescimento',
    problema: 'curto',
    objetivo: '',
  });

  assert.equal(errors.nome, 'Preencha entre 2 e 100 caracteres.');
  assert.equal(errors.email, 'Informe um e-mail válido.');
  assert.equal(errors.startup, 'Preencha entre 3 e 300 caracteres.');
  assert.equal(errors.estagio, 'Selecione o estágio da sua startup.');
  assert.equal(errors.problema, 'Preencha entre 10 e 1500 caracteres.');
  assert.equal(errors.objetivo, 'Preencha entre 10 e 1500 caracteres.');
});

test('trims values and rejects content over the configured maximum', () => {
  const errors = validateApplication({
    ...validData,
    nome: `  ${'a'.repeat(101)}  `,
  });
  assert.equal(errors.nome, 'Preencha entre 2 e 100 caracteres.');
});

test('keeps the public form disabled until delivery is verified', () => {
  assert.deepEqual(formConfig, {
    endpoint: 'https://formsubmit.co/ajax/mentoria@petersonbenhame.com.br',
    enabled: false,
    timeoutMs: 12000,
  });
  assert.equal(Object.isFrozen(formConfig), true);
});

test('rejects invalid data before calling the transport', async () => {
  let calls = 0;
  await assert.rejects(
    sendApplication({ ...validData, email: '' }, {
      endpoint: formConfig.endpoint,
      fetcher: async () => {
        calls += 1;
        return { ok: true, json: async () => ({ success: true }) };
      },
    }),
    /Revise os campos da candidatura/,
  );
  assert.equal(calls, 0);
});

test('rejects an endpoint outside the approved FormSubmit contract', async () => {
  await assert.rejects(
    sendApplication(validData, { endpoint: 'https://example.com/form' }),
    /O destino de envio não está configurado/,
  );
});

test('sends trimmed fields and accepts a positive service confirmation', async () => {
  let request;
  await sendApplication({ ...validData, nome: '  Peterson Benhame  ' }, {
    endpoint: formConfig.endpoint,
    timeoutMs: 100,
    fetcher: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ success: true }) };
    },
  });

  assert.equal(request.url, formConfig.endpoint);
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.signal instanceof AbortSignal, true);
  const body = JSON.parse(request.options.body);
  assert.equal(body.nome, 'Peterson Benhame');
  assert.equal(body._honey, '');
  assert.match(body._subject, /Nova candidatura/);
});

test('rejects a response that does not confirm delivery', async () => {
  await assert.rejects(
    sendApplication(validData, {
      endpoint: formConfig.endpoint,
      fetcher: async () => ({ ok: true, json: async () => ({ success: false }) }),
    }),
    /O serviço não confirmou o envio/,
  );
});
