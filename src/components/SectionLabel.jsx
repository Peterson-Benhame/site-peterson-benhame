import Reveal from './Reveal.jsx';

export default function SectionLabel({ index, label, note, reveal = false }) {
  const content = (
    <div className="section-label">
      <span>{index} / {label}</span>
      <span>{note}</span>
    </div>
  );

  return reveal ? <Reveal>{content}</Reveal> : content;
}
