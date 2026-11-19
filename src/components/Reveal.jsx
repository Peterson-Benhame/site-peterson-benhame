import { Children, cloneElement } from 'react';

export default function Reveal({ children, delay = 0 }) {
  const child = Children.only(children);
  return cloneElement(child, {
    'data-reveal': '',
    style: {
      ...child.props.style,
      '--reveal-delay': `${delay}ms`,
    },
  });
}
