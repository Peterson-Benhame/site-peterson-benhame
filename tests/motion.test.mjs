import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(site, path), 'utf8');

test('registers GSAP plugins once and respects reduced motion', () => {
  assert.equal(existsSync(join(site, 'src/animations/gsapSetup.js')), true);
  const setup = read('src/animations/gsapSetup.js');
  const css = read('style.css');
  assert.match(setup, /gsap\.registerPlugin/);
  assert.match(setup, /clearProps/);
  assert.match(setup, /motionQuery\s*=\s*['"]\(prefers-reduced-motion: no-preference\)['"]/);
  assert.match(setup, /desktopMotionQuery\s*=\s*['"]\(min-width: 801px\) and \(prefers-reduced-motion: no-preference\)['"]/);
  assert.doesNotMatch(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('builds the hero entrance without animating cinematic media', () => {
  const hero = read('src/sections/Hero.jsx');
  const css = read('style.css');
  assert.match(hero, /gsap\.timeline/);
  assert.match(hero, /hero-title-line/);
  assert.match(hero, /hero-highlight-line/);
  assert.match(hero, /power3\.out/);
  assert.doesNotMatch(hero, /\.(?:to|from|fromTo)\([^)]*(?:canvasRef|posterRef|cinema-canvas|cinema-poster)/s);
  assert.match(hero, /className="hero-actions"/);
  assert.match(hero, /\.from\(['"]\.hero-actions['"]/);
  assert.doesNotMatch(hero, /\.from\(['"]\.hero-copy \.primary['"]/);
  assert.doesNotMatch(hero, /\.from\(['"]\.hero-meta['"]/);
  assert.match(css, /\.hero-actions\s*\{[\s\S]*?flex-direction:\s*column;[\s\S]*?gap:\s*18px;/);
});

test('animates cards and journey progress with scoped ScrollTrigger', () => {
  const moment = read('src/sections/Moment.jsx');
  const journey = read('src/sections/Journey.jsx');
  const format = read('src/sections/Format.jsx');
  assert.match(moment, /y:\s*45/);
  assert.match(moment, /stagger:\s*0\.15/);
  assert.match(moment, /duration:\s*0\.75/);
  assert.match(journey, /journey-progress-fill/);
  assert.match(journey, /scrub:/);
  assert.match(journey, /is-active/);
  assert.match(journey, /is-past/);
  assert.match(format, /format-rule/);
  assert.match(format, /stagger:\s*0\.15/);
});

test('separates the About reveal and parallax transform layers', () => {
  const about = read('src/sections/About.jsx');
  assert.match(about, /className="identity-photo-frame"/);
  assert.match(about, /gsap\.to\(['"]\.identity-photo-frame['"]/);
  assert.match(about, /\.from\(['"]\.identity-photo['"]/);
});

test('keeps native details and disabled form behavior intact', () => {
  const faq = read('src/sections/FAQ.jsx');
  const application = read('src/sections/Application.jsx');
  assert.match(faq, /<details/);
  assert.match(faq, /preventDefault/);
  assert.match(faq, /duration:\s*0\.35/);
  assert.match(application, /disabled=\{sending \|\| !formConfig\.enabled \|\| !formConfig\.endpoint\}/);
  assert.match(application, /application-panel/);
});

test('renders the FAQ as a scoped tactile drawer without foreign UI dependencies', () => {
  const faq = read('src/sections/FAQ.jsx');
  const css = read('style.css');

  assert.match(faq, /className="faq-cabinet/);
  assert.match(faq, /className="faq-tray/);
  assert.match(faq, /className="faq-card/);
  assert.match(faq, /className="faq-tab/);
  assert.match(faq, /className="faq-drawer-front/);
  assert.match(faq, /aria-labelledby="faq-title"/);
  assert.match(css, /\.faq-cabinet\s*\{/);
  assert.match(css, /\.faq-card\s*\{/);
  assert.match(css, /var\(--accent\)/);
  assert.doesNotMatch(faq, /@\/components|tailwind|FaqDrawerOptions/);
  assert.doesNotMatch(css, /data:font|base64/);
});

test('scrolls between sections with ScrollToPlugin', () => {
  const setup = read('src/animations/gsapSetup.js');
  const app = read('src/App.jsx');
  const css = read('style.css');
  assert.equal(existsSync(join(site, 'src/hooks/useSectionScroll.js')), true);
  const hook = read('src/hooks/useSectionScroll.js');

  assert.match(setup, /ScrollToPlugin/);
  assert.match(setup, /registerPlugin\(ScrollTrigger,\s*ScrollToPlugin,\s*useGSAP\)/);
  assert.match(app, /useSectionScroll/);
  assert.match(hook, /gsap\.to\(window/);
  assert.match(hook, /scrollTo:\s*\{[\s\S]*y:\s*target[\s\S]*offsetY:[\s\S]*autoKill:\s*true/);
  assert.match(hook, /event\.(?:metaKey|ctrlKey)/);
  assert.match(hook, /skip-link/);
  assert.match(hook, /history\.pushState/);
  assert.match(css, /scroll-behavior:\s*auto/);
});
