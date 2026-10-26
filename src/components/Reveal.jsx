import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Replays every time the element enters or leaves the viewport,
// with a different animation for scrolling down vs. scrolling up.
export default function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current;
        gsap.set(el, { opacity: 0 });

        const show = (from) =>
          gsap.fromTo(
            el,
            from,
            {
              y: 0,
              scale: 1,
              rotationX: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              overwrite: "auto",
              onComplete: () => gsap.set(el, { clearProps: "transform" }),
            }
          );

        const hide = (to) =>
          gsap.to(el, { ...to, opacity: 0, duration: 0.5, ease: "power2.in", overwrite: "auto" });

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          end: "bottom 15%",
          // scrolling down: rise up from below
          onEnter: () => show({ y: 70, opacity: 0, scale: 1, transformPerspective: 800, rotationX: 0 }),
          // scrolling up: drop in from above, tilting forward
          onEnterBack: () => show({ y: -70, opacity: 0, scale: 0.94, transformPerspective: 800, rotationX: 8 }),
          // leaving through the top (scrolling down): float away upward
          onLeave: () => hide({ y: -50 }),
          // leaving through the bottom (scrolling up): sink back down
          onLeaveBack: () => hide({ y: 50 }),
        });
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
