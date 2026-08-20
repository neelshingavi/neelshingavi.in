import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const frameCount = 280;
const currentFrame = (index) => `/assets/sequence/ezgif-frame-${String(index).padStart(3, '0')}.png`;
const BLANK_GIF = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

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
    const loadingImages = new Map();
    const MAX_CACHED_IMAGES = 14; 
    let currentFocusFrame = 1;
    let lastRenderedFrame = 0;
    let isUnmounted = false;
    let prevFocusFrame = 1;

    const drawImage = (img) => {
      if (!img || !img.complete || img.naturalHeight === 0 || isUnmounted) return;
      
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      context.fillStyle = '#111210';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);

      const patchWidth = 240;
      const patchHeight = 150;
      const sourceX = img.width - patchWidth;
      const sourceY = img.height - patchHeight;
      const scaledX = centerShift_x + (sourceX * ratio);
      const scaledY = centerShift_y + (sourceY * ratio);
      const scaledW = patchWidth * ratio;
      const scaledH = patchHeight * ratio;

      context.drawImage(
        img,
        sourceX, sourceY, patchWidth, 1,
        scaledX, scaledY, scaledW, scaledH
      );
    };

    const loadFrame = (index) => {
      if (index < 1 || index > frameCount) return;
      if (loadedImages.has(index) || loadingImages.has(index)) return;
      
      const img = new Image();
      loadingImages.set(index, img);
      
      img.onload = () => {
        if (isUnmounted) return;
        loadingImages.delete(index);
        loadedImages.set(index, img);
        
        if (Math.abs(index - currentFocusFrame) <= 1 && lastRenderedFrame !== index) {
           drawImage(img);
           lastRenderedFrame = index;
        }
      };
      
      img.onerror = () => {
        if (isUnmounted) return;
        loadingImages.delete(index);
      };
      
      img.src = currentFrame(index);
    };

    const maintainBuffer = (currentIndex) => {
       prevFocusFrame = currentFocusFrame;
       currentFocusFrame = currentIndex;
       
       const scrollingForward = currentIndex >= prevFocusFrame;

       const desiredFrames = new Set();
       const addDesired = (idx) => {
         if (idx >= 1 && idx <= frameCount) desiredFrames.add(idx);
       };
       
       addDesired(currentIndex);
       
       if (scrollingForward) {
          for (let i = 1; i <= 6; i++) addDesired(currentIndex + i);
          for (let i = 1; i <= 2; i++) addDesired(currentIndex - i);
       } else {
          for (let i = 1; i <= 6; i++) addDesired(currentIndex - i);
          for (let i = 1; i <= 2; i++) addDesired(currentIndex + i);
       }

       // 1. Cancel ongoing loads that are obsolete
       for (const [index, img] of loadingImages.entries()) {
          if (!desiredFrames.has(index)) {
             img.onload = null;
             img.onerror = null;
             img.src = BLANK_GIF;
             loadingImages.delete(index);
          }
       }

       // 2. Request desired frames
       for (const index of desiredFrames) {
          loadFrame(index);
       }

       // 3. Prune cached images based on distance
       if (loadedImages.size > MAX_CACHED_IMAGES) {
          // Sort keys by distance from currentIndex, keep nearest
          const sortedKeys = Array.from(loadedImages.keys()).sort((a, b) => {
             return Math.abs(a - currentIndex) - Math.abs(b - currentIndex);
          });
          
          // Delete anything beyond the MAX_CACHED_IMAGES nearest
          for (let i = MAX_CACHED_IMAGES; i < sortedKeys.length; i++) {
             const keyToRemove = sortedKeys[i];
             loadedImages.delete(keyToRemove);
          }
       }
    };

    // Initial load sequence
    loadFrame(1);
    for(let i = 2; i <= 4; i++) {
       loadFrame(i);
    }

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
          scrub: 0.5
        },
        onUpdate: () => {
          if (isUnmounted) return;
          const currentIdx = Math.round(obj.frame);
          maintainBuffer(currentIdx);
          
          let frameToDraw = currentIdx;
          if (!loadedImages.has(frameToDraw)) {
             let offset = 1;
             let found = false;
             while (offset <= 15) {
                if (currentIdx - offset >= 1 && loadedImages.has(currentIdx - offset)) {
                   frameToDraw = currentIdx - offset;
                   found = true;
                   break;
                }
                if (currentIdx + offset <= frameCount && loadedImages.has(currentIdx + offset)) {
                   frameToDraw = currentIdx + offset;
                   found = true;
                   break;
                }
                offset++;
             }
             if (!found) frameToDraw = lastRenderedFrame;
          }

          if (frameToDraw >= 1 && loadedImages.has(frameToDraw) && frameToDraw !== lastRenderedFrame) {
             drawImage(loadedImages.get(frameToDraw));
             lastRenderedFrame = frameToDraw;
          }
        }
      });
    });

    return () => {
      isUnmounted = true;
      ctx.revert();
      for (const img of loadingImages.values()) {
        img.onload = null;
        img.onerror = null;
        img.src = BLANK_GIF;
      }
      loadingImages.clear();
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
        objectFit: 'cover'
      }}
    />
  );
}
