import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const frameCount = 280;
const currentFrame = (index) => `/assets/sequence/ezgif-frame-${String(index).padStart(3, '0')}.webp`;

export function ImageSequenceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    canvas.width = 1920;
    canvas.height = 1080;

    const loadedImages = new Map();
    const pendingLoads = new Set();
    let currentFocusFrame = 1;
    let lastRenderedFrame = 0;
    let isUnmounted = false;
    let rafId = null;

    const drawFrame = (img) => {
      if (!img || !img.complete || img.naturalHeight === 0 || isUnmounted) return;

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      context.fillStyle = '#111210';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );

      // Bottom-right watermark patch
      const patchWidth = 240;
      const patchHeight = 150;
      const sourceX = img.width - patchWidth;
      const sourceY = img.height - patchHeight;
      const scaledX = centerShift_x + sourceX * ratio;
      const scaledY = centerShift_y + sourceY * ratio;
      const scaledW = patchWidth * ratio;
      const scaledH = patchHeight * ratio;

      context.drawImage(
        img,
        sourceX,
        sourceY,
        patchWidth,
        1,
        scaledX,
        scaledY,
        scaledW,
        scaledH
      );
    };

    const requestRender = (frameIndex) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (isUnmounted) return;

        let frameToDraw = frameIndex;
        if (!loadedImages.has(frameToDraw)) {
          // Find closest loaded frame
          let offset = 1;
          let found = false;
          while (offset <= frameCount) {
            if (frameIndex - offset >= 1 && loadedImages.has(frameIndex - offset)) {
              frameToDraw = frameIndex - offset;
              found = true;
              break;
            }
            if (frameIndex + offset <= frameCount && loadedImages.has(frameIndex + offset)) {
              frameToDraw = frameIndex + offset;
              found = true;
              break;
            }
            offset++;
          }
          if (!found) frameToDraw = lastRenderedFrame;
        }

        if (frameToDraw >= 1 && loadedImages.has(frameToDraw) && frameToDraw !== lastRenderedFrame) {
          drawFrame(loadedImages.get(frameToDraw));
          lastRenderedFrame = frameToDraw;
        }
      });
    };

    const loadFrame = async (index, isPriority = false) => {
      if (index < 1 || index > frameCount) return;
      if (loadedImages.has(index) || pendingLoads.has(index)) return;

      pendingLoads.add(index);

      const img = new Image();
      img.src = currentFrame(index);

      try {
        if (img.decode) {
          await img.decode();
        } else {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }

        if (isUnmounted) return;
        loadedImages.set(index, img);
        pendingLoads.delete(index);

        // If this newly loaded frame is close to where user is viewing, re-render
        if (Math.abs(index - currentFocusFrame) <= 2) {
          requestRender(currentFocusFrame);
        }
      } catch {
        pendingLoads.delete(index);
      }
    };

    // --- Progressive Preload Strategy ---
    // 1. Instant paint first frame
    loadFrame(1, true).then(() => {
      if (!isUnmounted && lastRenderedFrame === 0) {
        requestRender(1);
      }
    });

    // 2. Coarse Keyframes: Load every 8th frame upfront (~35 lightweight WebP frames = ~550KB)
    // Guarantees zero blank screen across entire scroll height in ~300ms
    const keyframes = [];
    for (let i = 1; i <= frameCount; i += 8) {
      if (i !== 1) keyframes.push(i);
    }
    Promise.all(keyframes.map((idx) => loadFrame(idx, true))).then(() => {
      if (isUnmounted) return;
      // 3. Fill in secondary keyframes (every 4th frame)
      const secondaryFrames = [];
      for (let i = 4; i <= frameCount; i += 8) {
        secondaryFrames.push(i);
      }
      Promise.all(secondaryFrames.map((idx) => loadFrame(idx))).then(() => {
        if (isUnmounted) return;
        // 4. Fill in remaining frames in background
        const remainingFrames = [];
        for (let i = 1; i <= frameCount; i++) {
          if (!loadedImages.has(i) && !pendingLoads.has(i)) {
            remainingFrames.push(i);
          }
        }
        // Stream in small batches to preserve network headroom
        const streamNext = async (idx = 0) => {
          if (isUnmounted || idx >= remainingFrames.length) return;
          const batch = remainingFrames.slice(idx, idx + 6);
          await Promise.all(batch.map((f) => loadFrame(f)));
          if (!isUnmounted) {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(() => streamNext(idx + 6));
            } else {
              setTimeout(() => streamNext(idx + 6), 30);
            }
          }
        };
        streamNext();
      });
    });

    const obj = { frame: 1 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        frame: frameCount,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
        onUpdate: () => {
          if (isUnmounted) return;
          const currentIdx = Math.round(obj.frame);
          currentFocusFrame = currentIdx;

          // Prime nearby frames if scrolling faster than background fill
          for (let i = 1; i <= 5; i++) {
            if (currentIdx + i <= frameCount) loadFrame(currentIdx + i, true);
            if (currentIdx - i >= 1) loadFrame(currentIdx - i, true);
          }

          requestRender(currentIdx);
        },
      });
    });

    return () => {
      isUnmounted = true;
      if (rafId) cancelAnimationFrame(rafId);
      ctx.revert();
      pendingLoads.clear();
      loadedImages.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="background-sequence"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        objectFit: 'cover',
      }}
    />
  );
}
