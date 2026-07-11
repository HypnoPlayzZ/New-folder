"use client";

import { useEffect, useRef } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & { src: string };

/**
 * Below-the-fold video that only starts downloading when it approaches the
 * viewport — keeps first load to the hero footage alone.
 */
export default function LazyVideo({ src, ...rest }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || video.src) return;
        video.src = src;
        video.play().catch(() => {});
        io.disconnect();
      },
      { rootMargin: "150% 0px" }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  return <video ref={ref} muted loop playsInline preload="none" {...rest} />;
}
