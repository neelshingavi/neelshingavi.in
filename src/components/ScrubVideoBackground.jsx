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
const DEFAULT_VIDEO_SRC = '/assets/bg/portfolio-scrub.v1.mp4';

// Must match the -framerate used in encode-bg-video.sh.
const FPS = 24;

// Multi-segment scroll choreography across sections (from -> to normalized 0..279 frame cues).
// Falls back cleanly if an intermediate segment element is not present in the DOM.
const SEGMENTS = [
  { trigger: '#hero', start: 'top top', end: '+=350%', fromRatio: 0, toRatio: 120 / 279 },
  { trigger: '#work', start: 'top bottom', end: 'center center', fromRatio: 120 / 279, toRatio: 185 / 279 },
  { trigger: '#wins', start: 'top bottom', end: 'bottom top', fromRatio: 185 / 279, toRatio: 235 / 279 },
  { trigger: '#contact', start: 'top bottom', end: 'center center', fromRatio: 235 / 279, toRatio: 1 },
];

export function ScrubVideoBackground({ videoSrc = DEFAULT_VIDEO_SRC }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = true; // React doesn't reliably reflect the `muted` attribute

    const abort = new AbortController();
    let objectUrl = '';
    const triggers = [];
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
        const res = await fetch(videoSrc, { signal: abort.signal });
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
        const maxFrame = Math.max(0, frames - 1);

        const activeSegments = SEGMENTS.filter((seg) => document.querySelector(seg.trigger));
        const progress = new Array(activeSegments.length).fill(0);

        const recompute = () => {
          let nextFrame = 0;
          activeSegments.forEach((seg, idx) => {
            if (progress[idx] > 0) {
              const fromF = seg.fromRatio * maxFrame;
              const toF = seg.toRatio * maxFrame;
              nextFrame = fromF + progress[idx] * (toF - fromF);
            }
          });
          targetFrame = Math.min(Math.max(0, nextFrame), maxFrame);
          kick();
        };

        activeSegments.forEach((seg, idx) => {
          triggers.push(
            ScrollTrigger.create({
              trigger: seg.trigger,
              start: seg.start,
              end: seg.end,
              onUpdate: (self) => {
                progress[idx] = self.progress;
                recompute();
              },
              onRefresh: (self) => {
                progress[idx] = self.progress;
                recompute();
              },
            })
          );
        });

        // Correct frame immediately if the page was restored mid-scroll.
        recompute();
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
      triggers.forEach((t) => t.kill());
      video.removeAttribute('src');
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoSrc]);

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
