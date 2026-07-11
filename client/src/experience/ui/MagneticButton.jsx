// Magnetic button: a generous invisible hit-field around the button pulls the
// button toward the cursor (GSAP-damped), so the cursor effectively "snaps" to
// its center. Releases with an elastic settle.
import { useRef } from 'react';
import { gsap } from 'gsap';

export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.55,
  field = 28,
  ...rest
}) {
  const wrap = useRef();
  const btn = useRef();

  const onMove = (e) => {
    const r = btn.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(btn.current, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power3.out' });
  };
  const onLeave = () => {
    gsap.to(btn.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <span
      ref={wrap}
      className="sb-magnetic-field"
      style={{ padding: field }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <button ref={btn} className={className} onClick={onClick} {...rest}>
        {children}
      </button>
    </span>
  );
}
