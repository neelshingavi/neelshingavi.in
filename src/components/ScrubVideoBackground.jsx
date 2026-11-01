import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * Scroll-scrubbed background video.
 *
 * WHY THIS REPLACES ImageSequenceBackground:
 *  - 280 decoded 1280x720 frames = ~985 MB of bitmaps. One video file decodes
 *    on the GPU/video decoder and costs a few MB of RAM.
 *  - One request instead of 280.
 *  - The poster (static <div class="bg-poster"> in index.html) paints before any
 *    JS runs, so the page is never "blank while the background loads".
 *
 * REQUIREMENT: the file must be encoded ALL-INTRA (every frame a keyframe),
 * otherwise seeking snaps to sparse keyframes and scrubbing stutters.
 * Run `bash encode-bg-video.sh` — it does that for you.
 */

// Bump the version in the filename whenever you re-encode. /assets/* is served
// with `immutable, max-age=1y` (vercel.json), so reusing a name = stale forever.
const VIDEO_SRC = '/assets/bg/portfolio-scrub.v1.mp4';

// Must match the -framerate used in encode-bg-video.sh.
const FPS = 24;

// Scroll distance, in viewport heights, over which the whole clip plays.
// After that the last frame is held (and CSS dims it). Lower = faster scrub.
const SCRUB_SCREENS = 3.5;

export function ScrubVideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = true; // React doesn't reliably reflect the `muted` attribute

    const abort = new AbortController();
    let objectUrl = '';
    let trigger = null;
    let raf = 0;
    let frames = 0;
    let targetFrame = 0; // where scroll says we should be (float)
    let shownFrame = 0; // eased value
    let requestedIdx = -1; // last frame index we actually asked the video for

    // Work in whole frame indices. Seeking to the MIDDLE of a frame's time slot
    // avoids float rounding landing on the previous frame in some browsers.
    const step = () => {
      raf = 0;
      shownFrame += (targetFrame - shownFrame) * 0.3;
      if (Math.abs(targetFrame - shownFrame) < 0.05) shownFrame = targetFrame;

      const idx = Math.round(shownFrame);
      // Never stack seeks: one in flight at a time is what keeps it smooth.
      if (idx !== requestedIdx && !video.seeking) {
        requestedIdx = idx;
        video.currentTime = (idx + 0.5) / FPS;
      }
      if (shownFrame !== targetFrame || idx !== requestedIdx) {
        raf = requestAnimationFrame(step);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const load = async () => {
      try {
        // Download the whole file up front and play from memory: every seek is
        // then instant (no range requests mid-scroll).
        const res = await fetch(VIDEO_SRC, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (abort.signal.aborted) return;

        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;

        await new Promise((resolve, reject) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.addEventListener('error', reject, { once: true });
          // iOS/iPadOS won't decode a not-yet-played video; muted+inline play()
          // is allowed without a gesture, then we immediately pause.
          const p = video.play();
          if (p && typeof p.then === 'function') {
            p.then(() => video.pause()).catch(() => {});
          }
        });
        if (abort.signal.aborted) return;

        frames = Math.max(1, Math.round(video.duration * FPS));

        trigger = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 0,
          end: () => window.innerHeight * SCRUB_SCREENS,
          onUpdate: (self) => {
            targetFrame = self.progress * (frames - 1);
            kick();
          },
        });

        // Correct frame immediately if the page was restored mid-scroll.
        targetFrame = trigger.progress * (frames - 1);
        shownFrame = targetFrame;
        kick();
        video.classList.add('is-ready'); // CSS fades it in over the poster
      } catch (err) {
        if (err?.name !== 'AbortError') {
          // Not fatal: the static poster stays on screen.
          console.warn('[ScrubVideoBackground] falling back to poster:', err);
        }
      }
    };

    load();

    return () => {
      abort.abort();
      if (raf) cancelAnimationFrame(raf);
      if (trigger) trigger.kill();
      video.removeAttribute('src');
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="bg-video"
      muted
      playsInline
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
      disablePictureInPicture
      disableRemotePlayback
    />
  );
}
