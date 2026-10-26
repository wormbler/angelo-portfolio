import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import "./Lightbox.css";

function fittedRect(nw, nh) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min((vw * 0.94) / nw, (vh * 0.88) / nh);
  const width = nw * scale;
  const height = nh * scale;
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
}

export default function Lightbox({ src, alt, getOriginRect, naturalSize, onClose }) {
  const backdrop = useRef(null);
  const glow = useRef(null);
  const img = useRef(null);
  const closeBtn = useRef(null);
  const closing = useRef(false);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const target = () => {
    const { w, h } = naturalSize();
    return fittedRect(w, h);
  };

  useLayoutEffect(() => {
    const from = getOriginRect();
    const to = target();
    const d = reduced.current ? 0 : 1;
    gsap.set(img.current, { ...from, borderRadius: 20 });
    const tl = gsap.timeline();
    tl.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.5 * d, ease: "power2.out" })
      .fromTo(glow.current, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 1.1 * d, ease: "power3.out" }, 0.2 * d)
      .to(img.current, { ...to, borderRadius: 12, duration: 0.9 * d, ease: "expo.inOut" }, 0)
      .fromTo(closeBtn.current, { opacity: 0, scale: 0.6, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.5 * d, ease: "back.out(2)" }, 0.5 * d);

    let pulse;
    let onMove;
    if (!reduced.current) {
      pulse = gsap.to(glow.current, { scale: 1.2, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
      const qx = gsap.quickTo(img.current, "x", { duration: 0.8, ease: "power3.out" });
      const qy = gsap.quickTo(img.current, "y", { duration: 0.8, ease: "power3.out" });
      onMove = (e) => {
        if (closing.current) return;
        qx((e.clientX / window.innerWidth - 0.5) * -24);
        qy((e.clientY / window.innerHeight - 0.5) * -24);
      };
      window.addEventListener("mousemove", onMove);
    }
    return () => {
      tl.kill();
      pulse?.kill();
      if (onMove) window.removeEventListener("mousemove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const d = reduced.current ? 0 : 1;
    gsap.to(closeBtn.current, { opacity: 0, rotation: 90, duration: 0.2 * d });
    gsap.to(glow.current, { opacity: 0, duration: 0.4 * d });
    gsap.to(backdrop.current, { opacity: 0, duration: 0.6 * d, delay: 0.2 * d, ease: "power2.in" });
    gsap.to(img.current, {
      ...getOriginRect(),
      x: 0,
      y: 0,
      borderRadius: 20,
      duration: 0.8 * d,
      ease: "expo.inOut",
      onComplete: onClose,
    });
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    const onResize = () => !closing.current && gsap.set(img.current, target());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt}>
      <div ref={backdrop} className="lightbox-backdrop" onClick={close} />
      <div ref={glow} className="lightbox-glow" aria-hidden="true" />
      <img ref={img} className="lightbox-img" src={src} alt={alt} onClick={close} />
      <button ref={closeBtn} className="lightbox-close" aria-label="Close full-screen image" onClick={close}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
