import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const project = join(site, '..');
const read = (path) => readFileSync(join(site, path), 'utf8');

test('preserves the PB Cinema custom-layout contract', () => {
  const html = read('index.html');
  assert.match(html, /<meta\b(?=[^>]*name="pb-layout")(?=[^>]*content="custom")[^>]*>/);
  assert.match(html, /<noscript>[\s\S]*<h1>[\s\S]*<\/h1>[\s\S]*<\/noscript>/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);

  for (const file of ['style.css', 'theme.css', 'app.js', 'content.js', 'config.js']) {
    assert.equal(existsSync(join(site, file)), true, `${file} must remain at the site root`);
  }

  assert.match(read('content.js'), /window\.PB_CINEMA\s*=/);
});

test('declares the approved React, Vite and GSAP toolchain', () => {
  assert.equal(existsSync(join(site, 'package.json')), true, 'package.json must exist');
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.type, 'module');
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['@gsap/react', 'gsap', 'react', 'react-dom']);
  assert.deepEqual(Object.keys(pkg.devDependencies).sort(), ['@vitejs/plugin-react', 'vite']);
  assert.deepEqual(Object.keys(pkg.scripts).sort(), ['build', 'dev', 'preview', 'test', 'test:build']);
});

test('configures relative multi-page output and asset copying', () => {
  assert.equal(existsSync(join(site, 'vite.config.js')), true, 'vite.config.js must exist');
  const config = read('vite.config.js');
  assert.match(config, /base:\s*['"]\.\/['"]/);
  assert.match(config, /index\.html/);
  assert.match(config, /privacidade\.html/);
  assert.match(config, /copyAssetsPlugin/);
});

test('organizes the page into semantic React sections', () => {
  const components = ['Header', 'Footer', 'SectionLabel'];
  const sections = ['Hero', 'Moment', 'Journey', 'About', 'Format', 'FAQ', 'Application'];

  for (const name of components) {
    assert.equal(existsSync(join(site, 'src', 'components', `${name}.jsx`)), true, `${name}.jsx must exist`);
  }
  for (const name of sections) {
    assert.equal(existsSync(join(site, 'src', 'sections', `${name}.jsx`)), true, `${name}.jsx must exist`);
  }

  const app = read('src/App.jsx');
  for (const name of [...components.slice(0, 2), ...sections]) {
    assert.match(app, new RegExp(`<${name}\\b`), `${name} must be composed by App`);
  }

  const sectionContracts = {
    Hero: ['inicio', 'hero-title'],
    Moment: ['seu-momento', 'moment-title'],
    Journey: ['jornada', 'journey-title'],
    About: ['sobre', 'about-title'],
    Format: ['como-funciona', 'format-title'],
    FAQ: ['duvidas', 'faq-title'],
    Application: ['candidatura', 'application-title'],
  };

  for (const [name, [id, title]] of Object.entries(sectionContracts)) {
    const source = read(`src/sections/${name}.jsx`);
    assert.match(source, new RegExp(`id=["'{]+${id}`));
    assert.match(source, new RegExp(`aria-labelledby=["'{]+${title}`));
  }

  const moment = read('src/sections/Moment.jsx');
  for (const icon of ['ideia.png', 'validacao.png', 'construir-mvp.png']) {
    assert.match(moment, new RegExp(`assets/img/${icon.replace('.', '\\.')} ` .trim()));
  }
  assert.match(read('src/sections/Application.jsx'), /applicationForm\.js/);
});

test('keeps cinematic media progressive and disposable', () => {
  assert.equal(existsSync(join(site, 'src', 'hooks', 'useCinemaHero.js')), true, 'useCinemaHero.js must exist');
  const hook = read('src/hooks/useCinemaHero.js');
  const hero = read('src/sections/Hero.jsx');

  assert.match(hook, /window\.PB_CINEMA/);
  assert.doesNotMatch(hook, /prefers-reduced-motion:\s*reduce/);
  assert.match(hook, /min-width:\s*901px/);
  assert.match(hook, /navigator\.connection\?\.saveData/);
  assert.match(hook, /requestAnimationFrame/);
  assert.match(hook, /cancelAnimationFrame/);
  assert.match(hook, /passive:\s*true/);
  assert.match(hook, /removeEventListener/);
  assert.match(hook, /image\.onload\s*=\s*\(\)\s*=>\s*\{[\s\S]*activatePresentation\(\)/);
  assert.doesNotMatch(hook, /classList\.toggle\(['"]cinema-enabled['"],\s*enabled\)/);
  assert.match(hero, /useCinemaHero/);
  assert.match(hero, /cinema-poster/);
  assert.match(hero, /cinema-canvas/);
  assert.match(hero, /className="structure"/);
  assert.match(hero, /Investigue o problema/);
  assert.match(hero, /Teste suas hipóteses/);
  assert.match(hero, /Defina o que construir/);
});

test('documents the React development and production preview commands', () => {
  const guide = readFileSync(join(project, 'LEIA-ME.md'), 'utf8');
  assert.match(guide, /npm install/);
  assert.match(guide, /npm run dev/);
  assert.match(guide, /npm run build/);
  assert.match(guide, /npm run preview/);
  assert.doesNotMatch(guide, /python -m http\.server/);
});

test('keeps the legacy reveal helper disposable and off the scroll path', () => {
  assert.equal(existsSync(join(site, 'src', 'hooks', 'useReveal.js')), true, 'useReveal.js must exist');
  assert.equal(existsSync(join(site, 'src', 'components', 'Reveal.jsx')), true, 'Reveal.jsx must exist');
  const hook = read('src/hooks/useReveal.js');
  const component = read('src/components/Reveal.jsx');
  const css = read('style.css');

  assert.match(hook, /prefers-reduced-motion:\s*reduce/);
  assert.match(hook, /IntersectionObserver/);
  assert.match(hook, /threshold:\s*0\.12/);
  assert.match(hook, /rootMargin:\s*['"][^'"]*-12%[^'"]*['"]/);
  assert.match(hook, /observer\.unobserve/);
  assert.match(hook, /observer\.disconnect/);
  assert.doesNotMatch(hook, /addEventListener\(['"]scroll/);
  assert.match(component, /--reveal-delay/);
  assert.match(css, /translateY\(12px\)/);
  assert.match(css, /520ms/);
  assert.match(css, /\.is-reveal-pending/);
});

test('uses GSAP as the single active motion system', () => {
  const app = read('src/App.jsx');
  const hero = read('src/sections/Hero.jsx');
  const moment = read('src/sections/Moment.jsx');
  const journey = read('src/sections/Journey.jsx');
  const about = read('src/sections/About.jsx');
  const format = read('src/sections/Format.jsx');
  const faq = read('src/sections/FAQ.jsx');
  const application = read('src/sections/Application.jsx');

  assert.doesNotMatch(app, /useReveal/);
  for (const source of [hero, moment, journey, about, format, faq, application]) {
    assert.match(source, /useGSAP/);
    assert.doesNotMatch(source, /<Reveal/);
  }
});
