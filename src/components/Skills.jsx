import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { skillGroups } from "../data/site";
import Reveal from "./Reveal";
import "./Skills.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Skills() {
  const grid = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray(grid.current.querySelectorAll(".skill-card"));
        gsap.set(cards, { opacity: 0 });

        const show = (batch, from, staggerFrom) =>
          gsap.fromTo(
            batch,
            from,
            {
              y: 0,
              scale: 1,
              rotationX: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              stagger: { each: 0.12, from: staggerFrom },
              overwrite: "auto",
              onComplete: () => gsap.set(batch, { clearProps: "transform" }),
            }
          );

        const hide = (batch, to) =>
          gsap.to(batch, { ...to, opacity: 0, duration: 0.4, ease: "power2.in", stagger: 0.05, overwrite: "auto" });

        ScrollTrigger.batch(cards, {
          start: "top 88%",
          end: "bottom 10%",
          onEnter: (batch) =>
            show(batch, { y: 70, opacity: 0, scale: 0.95, rotationX: 0, transformPerspective: 800 }, "start"),
          onEnterBack: (batch) =>
            show(batch, { y: -70, opacity: 0, scale: 0.92, rotationX: 10, transformPerspective: 800 }, "end"),
          onLeave: (batch) => hide(batch, { y: -50, scale: 0.96 }),
          onLeaveBack: (batch) => hide(batch, { y: 50, scale: 0.96 }),
        });
      });
    },
    { scope: grid }
  );

  return (
    <section className="section skills" id="skills">
      <Reveal>
        <span className="label">Capabilities</span>
        <h2 className="headline skills-title">Skills &amp; toolkit</h2>
      </Reveal>
      <div ref={grid} className="skills-grid">
        {skillGroups.map((group) => (
          <div key={group.title} className="skill-card">
            <h3 className="skill-card-title">{group.title}</h3>
            <p className="skill-card-desc">{group.description}</p>
            <ul className="skill-tags">
              {group.items.map((item) => (
                <li key={item} className="skill-tag">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
