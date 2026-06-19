import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

const DEFAULTS = {
  loopDuration:  3500,
  snakeFraction: 0.25,
  segmentCount:  12,
  pointsPerSeg:  24,
  cornerRadius:  14,
  padding:       3,
  haloWidth:     6,
  haloBlur:      3,
  midWidth:      2.5,
  coreWidth:     1.2,
  haloAlpha:     0.3,
  midAlpha:      0.5,
  coreAlpha:     1.0,
  color:         [104, 197, 255] as [number, number, number],
};

type Config = typeof DEFAULTS;

interface SnakeBorderProps {
  children?: ReactNode;
  /** Override any default values. */
  config?: Partial<Config>;
  className?: string;
  style?: CSSProperties;
}

/** Maps a scalar distance along a rounded-rect perimeter to [x, y]. */
function pointOnPerimeter(
  dist: number,
  pad: number,
  iW: number,
  iH: number,
  r: number,
  sW: number,
  sH: number,
  arc: number,
  perim: number,
): [number, number] {
  let t = ((dist % perim) + perim) % perim;

  if (t < sW)  return [pad + r + t, pad];                                                                                          // top
  t -= sW;
  if (t < arc) { const a = -Math.PI / 2 + t / r; return [pad + iW - r + r * Math.cos(a), pad +      r + r * Math.sin(a)]; } // top-right
  t -= arc;
  if (t < sH)  return [pad + iW, pad + r + t];                                                                                    // right
  t -= sH;
  if (t < arc) { const a =            t / r; return [pad + iW - r + r * Math.cos(a), pad + iH - r + r * Math.sin(a)]; } // bottom-right
  t -= arc;
  if (t < sW)  return [pad + iW - r - t, pad + iH];                                                                               // bottom
  t -= sW;
  if (t < arc) { const a =  Math.PI / 2 + t / r; return [pad +      r + r * Math.cos(a), pad + iH - r + r * Math.sin(a)]; } // bottom-left
  t -= arc;
  if (t < sH)  return [pad, pad + iH - r - t];                                                                                    // left
  t -= sH;
  if (t < arc) { const a =  Math.PI     + t / r; return [pad +      r + r * Math.cos(a), pad +      r + r * Math.sin(a)]; } // top-left

  return [pad + r, pad];
}

/** Draws one body segment with 3 layered strokes for a glow effect. */
function drawSegment(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  alpha: number,
  cfg: Config,
  dpr: number,
): void {
  const [R, G, B] = cfg.color;

  const trace = () => {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  };

  // Halo (blurred)
  ctx.save();
  trace();
  ctx.strokeStyle = `rgba(${R},${G},${B},${cfg.haloAlpha * alpha})`;
  ctx.lineWidth   = cfg.haloWidth * dpr;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.filter      = `blur(${cfg.haloBlur * dpr}px)`;
  ctx.stroke();
  ctx.restore();

  // Mid
  trace();
  ctx.strokeStyle = `rgba(${R},${G},${B},${cfg.midAlpha * alpha})`;
  ctx.lineWidth   = cfg.midWidth * dpr;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.stroke();

  // Core
  trace();
  ctx.strokeStyle = `rgba(${R},${G},${B},${cfg.coreAlpha * alpha})`;
  ctx.lineWidth   = cfg.coreWidth * dpr;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.stroke();
}

/** Wraps children with an animated glowing snake that traces the border. */
export function SnakeBorder({ children, config, className, style }: SnakeBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfgRef    = useRef<Config>({ ...DEFAULTS });
  cfgRef.current  = { ...DEFAULTS, ...config };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr   = window.devicePixelRatio || 1;
    let running = true;
    let rafId: number | null = null;

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width  = Math.round(width  * dpr);
      canvas.height = Math.round(height * dpr);
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);

    // Reads cfgRef each frame so config changes apply without restarting the loop.
    function animate(timestamp: number) {
      if (!running || !canvas) return;

      const cfg = cfgRef.current;
      const ctx = canvas.getContext("2d");
      const W   = canvas.width;
      const H   = canvas.height;

      if (!ctx || W <= 0 || H <= 0) { rafId = requestAnimationFrame(animate); return; }

      ctx.clearRect(0, 0, W, H);

      const pad   = cfg.padding * dpr;
      const iW    = W - 2 * pad;
      const iH    = H - 2 * pad;
      const r     = Math.max(0, Math.min(cfg.cornerRadius * dpr, Math.min(iW, iH) / 2));
      const sW    = Math.max(0, iW - 2 * r);
      const sH    = Math.max(0, iH - 2 * r);
      const arc   = (Math.PI / 2) * r;
      const perim = 2 * sW + 2 * sH + 4 * arc;

      if (perim <= 0) { rafId = requestAnimationFrame(animate); return; }

      const snakeLen = cfg.snakeFraction * perim;
      const segLen   = snakeLen / cfg.segmentCount;
      const headDist = ((timestamp / cfg.loopDuration) % 1) * perim;

      ctx.filter = "none";

      for (let seg = 0; seg < cfg.segmentCount; seg++) {
        // Sine envelope — fades at both tips.
        const alpha = 0.22 * Math.sin(((seg + 0.5) / cfg.segmentCount) * Math.PI);
        if (alpha < 0.002) continue;

        const start  = headDist - snakeLen / 2 + seg * segLen;
        const end    = start + segLen;
        const points = Array.from({ length: cfg.pointsPerSeg + 1 }, (_, k) =>
          pointOnPerimeter(
            start + (k / cfg.pointsPerSeg) * (end - start),
            pad, iW, iH, r, sW, sH, arc, perim,
          )
        );

        drawSegment(ctx, points, alpha, cfg, dpr);
      }

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []); // runs once; config changes flow through cfgRef

  return (
    <div
      className={className}
      style={{
        position:     "relative",
        overflow:     "hidden",
        borderRadius: cfgRef.current.cornerRadius,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position:      "absolute",
          inset:         0,
          width:         "100%",
          height:        "100%",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}