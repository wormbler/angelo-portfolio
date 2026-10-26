import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lightbox from "./Lightbox";
import "./ProjectCard.css";

const canHover = () =>
  window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches;

export default function ProjectCard({ project }) {
  const { role, title, description, tech = [], github, demo, image } = project;
  const [imgFailed, setImgFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const imgRef = useRef(null);

  const getOriginRect = () => {
    const r = imgRef.current.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  };
  const naturalSize = () => ({
    w: imgRef.current.naturalWidth || 16,
    h: imgRef.current.naturalHeight || 10,
  });

  const mediaRef = useRef(null);
  const hintRef = useRef(null);

  const onEnter = () => {
    if (!canHover() || !hintRef.current) return;
    gsap.to(hintRef.current, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" });
  };

  const onMove = (e) => {
    if (!canHover()) return;
    const r = mediaRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(mediaRef.current, {
      rotationY: px * 10,
      rotationX: -py * 10,
      transformPerspective: 800,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
    if (hintRef.current) {
      gsap.to(hintRef.current, {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        duration: 0.25,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const onLeave = () => {
    gsap.to(mediaRef.current, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
    if (hintRef.current) {
      gsap.to(hintRef.current, { opacity: 0, scale: 0.6, duration: 0.25 });
    }
  };

  const openFull = () => {
    gsap.set(mediaRef.current, { rotationX: 0, rotationY: 0 });
    setOpen(true);
  };

  return (
    <article className="project-card">
      <div
        ref={mediaRef}
        className="project-card-media"
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {image && !imgFailed ? (
          <>
            <button
              type="button"
              className="project-card-zoom"
              aria-label={`View ${title} screenshot full screen`}
              onClick={openFull}
            >
              <img
                ref={imgRef}
                className="project-card-img"
                src={image}
                alt={`Screenshot of the ${title} project`}
                decoding="async"
                style={open ? { visibility: "hidden" } : undefined}
                onLoad={() => ScrollTrigger.refresh()}
                onError={() => setImgFailed(true)}
              />
            </button>
            <span ref={hintRef} className="project-card-hint" aria-hidden="true">
              View
            </span>
            {open && (
              <Lightbox
                src={image}
                alt={`Full-screen screenshot of the ${title} project`}
                getOriginRect={getOriginRect}
                naturalSize={naturalSize}
                onClose={() => setOpen(false)}
              />
            )}
          </>
        ) : (
          <div className="project-card-placeholder" role="img" aria-label={`${title} preview not available`}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="9" cy="9" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>
      <div className="project-card-body">
        {role && <span className="label project-card-role">{role}</span>}
        <h3>{title}</h3>
        <p className="project-card-desc">{description}</p>
        <ul className="project-card-tech">
          {tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="project-card-links">
          {github && (
            <a className="btn btn-sm" href={github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {demo && (
            <a className="btn btn-sm btn-outline" href={demo} target="_blank" rel="noreferrer">
              Live demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
