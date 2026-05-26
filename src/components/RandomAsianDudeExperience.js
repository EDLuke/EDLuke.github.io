import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import profilePic from '../assets/profile-pic.jpg';
import { isWebGLAvailable, prefersReducedMotion, getQualityTier } from '../globe/capabilities';
import { createScene } from '../globe/scene';
import { clamp01, smoothstep } from '../globe/geo';
import { WAYPOINTS, getWaypointParams } from '../globe/route';
import { activeIndex } from '../globe/visibility';

const SCROLL_VH = 760;
const JOURNEY_START = 0.27;
const WAYPOINT_CENTERS = getWaypointParams();
const WORLD_POPULATION_BASE = 8293254786;
const WORLD_POPULATION_BASE_TIME = Date.UTC(2026, 4, 22, 12, 0, 0);
const WORLD_POPULATION_GAIN_PER_SECOND = 2.25;

function formatCoordinate(value, positive, negative) {
  const direction = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(1)}deg ${direction}`;
}

function getWorldPopulationEstimate(now = Date.now()) {
  const elapsedSeconds = Math.max(0, (now - WORLD_POPULATION_BASE_TIME) / 1000);
  return Math.round(WORLD_POPULATION_BASE + elapsedSeconds * WORLD_POPULATION_GAIN_PER_SECOND);
}

function useWorldPopulation() {
  const [population, setPopulation] = useState(() => getWorldPopulationEstimate());

  useEffect(() => {
    const tick = () => setPopulation(getWorldPopulationEstimate());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return population.toLocaleString('en-US');
}

function StaticGlobe() {
  return (
    <div className="rad-static-globe" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="rad-socials" aria-label="Social links">
      <a href="https://github.com/EDLuke" aria-label="GitHub">
        <FontAwesomeIcon icon={faGithub} />
      </a>
      <a href="https://www.linkedin.com/in/luke-zhang/" aria-label="LinkedIn">
        <FontAwesomeIcon icon={faLinkedin} />
      </a>
      <a href="https://www.instagram.com/ed_lukez/" aria-label="Instagram">
        <FontAwesomeIcon icon={faInstagram} />
      </a>
    </div>
  );
}

function CoverLayer({ progress }) {
  const worldPopulation = useWorldPopulation();
  const coverExit = smoothstep(0.05, 0.29, progress);
  const style = {
    opacity: 1 - coverExit,
    transform: `translate3d(0, ${-44 * coverExit}vh, 0) scale(${1 - coverExit * 0.06})`,
    pointerEvents: coverExit > 0.75 ? 'none' : 'auto',
  };

  return (
    <section className="rad-cover-layer" style={style} aria-label="Random Asian Dude cover">
      <div className="rad-cover-profile">
        <div className="rad-photo-frame">
          <img src={profilePic} alt="Luke Zhang" />
        </div>
        <h1>
          random asian dude 3000
          <span className="rad-verified" aria-label="verified" />
        </h1>
        <p className="rad-cover-handle">@edluke</p>
        <p className="rad-cover-bio">
          random asian dude be everywhere, Buiilding since 1993
        </p>
        <p className="rad-cover-link">hiding in the build logs - edluke.github.io</p>
      </div>

      <div className="rad-stat-dock" aria-label="Profile statistics">
        <div>
          <span>posts</span>
          <strong>13</strong>
        </div>
        <div>
          <span>following</span>
          <strong>1993</strong>
        </div>
        <div>
          <span>followers</span>
          <strong
            className="rad-population-count"
            aria-label={`World population estimate ${worldPopulation}`}
          >
            {worldPopulation}
          </strong>
        </div>
        <div className="rad-dock-actions">
          <SocialLinks />
          <button type="button">Follow</button>
        </div>
      </div>
    </section>
  );
}

function JourneyLayer({ activeWaypoint, activeWaypointIndex, progress, jumpTo }) {
  const journeyOpacity = smoothstep(0.25, 0.42, progress);
  const routeProgress = clamp01((progress - JOURNEY_START) / (1 - JOURNEY_START));
  const style = {
    opacity: journeyOpacity,
    transform: `translate3d(0, ${18 * (1 - journeyOpacity)}px, 0)`,
    pointerEvents: journeyOpacity > 0.35 ? 'auto' : 'none',
  };

  return (
    <section className="rad-journey-layer" style={style} aria-label="Resume route">
      <div className="rad-route-card">
        <div className="rad-pin-meta">
          <span>{String(activeWaypointIndex + 1).padStart(2, '0')} / {WAYPOINTS.length}</span>
          <span>
            orbit
            {' '}
            {formatCoordinate(activeWaypoint.lat, 'N', 'S')}
            {' '}
            {formatCoordinate(activeWaypoint.lng, 'E', 'W')}
          </span>
        </div>
        <h2>{activeWaypoint.name}</h2>
        <p>{activeWaypoint.caption}</p>
        <div className="rad-place">{activeWaypoint.place}</div>
      </div>

      <div className="rad-pin-rail" aria-label="Jump to resume stop">
        {WAYPOINTS.map((waypoint, index) => {
          const active = index === activeWaypointIndex;
          return (
            <button
              key={waypoint.id}
              className={active ? 'active' : ''}
              type="button"
              onClick={() => jumpTo(index)}
              aria-label={`Jump to ${waypoint.name}`}
            >
              <span>{index + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="rad-route-progress" aria-label="Route progress">
        <span style={{ width: `${Math.round(routeProgress * 100)}%` }} />
      </div>
    </section>
  );
}

export default function RandomAsianDudeExperience() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [useStatic] = useState(() => !isWebGLAvailable() || prefersReducedMotion());
  const journeyProgress = clamp01((progress - JOURNEY_START) / (1 - JOURNEY_START));
  const activeWaypointIndex = activeIndex(journeyProgress, WAYPOINT_CENTERS);
  const activeWaypoint = WAYPOINTS[activeWaypointIndex];

  const quality = useMemo(() => {
    if (typeof window === 'undefined') {
      return getQualityTier(1200);
    }
    return getQualityTier(window.innerWidth);
  }, []);

  useEffect(() => {
    if (useStatic || !canvasRef.current) {
      return undefined;
    }

    const scene = createScene(canvasRef.current, { quality });
    sceneRef.current = scene;
    let raf = 0;

    const readScroll = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = clamp01(max > 0 ? window.scrollY / max : 0);
      scene.setProgress(nextProgress);
      setProgress(nextProgress);
    };
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(readScroll);
      }
    };
    const onPointer = (event) => {
      scene.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    const onResize = () => {
      scene.resize();
      readScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer);
    window.addEventListener('resize', onResize);
    readScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      if (raf) {
        cancelAnimationFrame(raf);
      }
      scene.dispose();
      sceneRef.current = null;
    };
  }, [quality, useStatic]);

  useEffect(() => {
    if (!useStatic) {
      return undefined;
    }

    let raf = 0;
    const readScroll = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(clamp01(max > 0 ? window.scrollY / max : 0));
    };
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(readScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    readScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [useStatic]);

  const jumpTo = (index) => {
    const center = (WAYPOINT_CENTERS[index] * (1 - JOURNEY_START)) + JOURNEY_START;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: center * max, behavior: 'smooth' });
  };

  return (
    <main className="rad-page">
      {!useStatic && <canvas className="rad-canvas" ref={canvasRef} aria-hidden="true" />}
      {useStatic && <StaticGlobe />}
      <div className="rad-space-noise" aria-hidden="true" />
      <CoverLayer progress={progress} />
      <JourneyLayer
        activeWaypoint={activeWaypoint}
        activeWaypointIndex={activeWaypointIndex}
        progress={progress}
        jumpTo={jumpTo}
      />
      <div className="rad-scroll-spacer" style={{ height: `${SCROLL_VH}vh` }} aria-hidden="true" />
    </main>
  );
}
