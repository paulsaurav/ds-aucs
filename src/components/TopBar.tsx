"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

export default function TopBar({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".topbar__fill", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });
    },
    { scope: ref },
  );

  return (
    <div className="topbar" ref={ref}>
      <Link href="/" className="topbar__home">
        DS Lab
      </Link>
      <span className="topbar__label" data-step-label>
        {label}
      </span>
      <span className="topbar__track" aria-hidden>
        <span className="topbar__fill" />
      </span>
    </div>
  );
}
