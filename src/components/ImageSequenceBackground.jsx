import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const frameCount = 280;
const currentFrame = (index) => `/assets/sequence/ezgif-frame-${String(index).padStart(3, '0')}.png`;

export function ImageSequenceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    // Set internal canvas resolution to match source images
    canvas.width = 1920;
    canvas.height = 1080;

    const images = [];
    const obj = { frame: 1 };

    // Function to draw image maintaining aspect ratio (cover)
    const drawImage = (img) => {
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      context.fillStyle = '#111210'; // Match ink background
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);

      // --- PRODUCTION-GRADE WATERMARK REMOVAL (VERTICAL STRETCH) ---
      // The blur method didn't work because the star was too bright.
      // Instead, we take a 1-pixel tall slice from the clean background directly 
      // above the stars, and stretch it all the way to the bottom right corner.
      // Because it's a smooth gradient, the stretch perfectly blends in!

      const patchWidth = 240; // Cover the rightmost 280 pixels
      const patchHeight = 150; // Cover the bottom 180 pixels
      
      const sourceX = img.width - patchWidth;
      const sourceY = img.height - patchHeight; // This should be just above the highest star
      
      const scaledX = centerShift_x + (sourceX * ratio);
      const scaledY = centerShift_y + (sourceY * ratio);
      const scaledW = patchWidth * ratio;
      const scaledH = patchHeight * ratio;

      // Draw a 1-pixel slice from the clean area and stretch it down over the watermark area
      context.drawImage(
        img,
        sourceX, sourceY, patchWidth, 1, // Take 1 pixel tall slice
        scaledX, scaledY, scaledW, scaledH // Stretch it down to the bottom
      );
    };

    // Preload first frame immediately
    const img1 = new Image();
    img1.src = currentFrame(1);
    img1.onload = () => {
      drawImage(img1);
    };
    images[0] = img1;

    // Progressively preload the rest in the background
    for (let i = 2; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images[i - 1] = img;
    }

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: 'body', // Scrub over the entire body scroll
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5 // Smoothing
        },
        onUpdate: () => {
          const img = images[obj.frame];
          if (img && img.complete && img.naturalHeight !== 0) {
            drawImage(img);
          }
        }
      });
    });

    return () => ctx.revert();
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
