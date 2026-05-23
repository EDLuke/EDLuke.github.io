export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
    );
  } catch (error) {
    return false;
  }
}

export function prefersReducedMotion() {
  return Boolean(
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
}

export function getQualityTier(viewportWidth) {
  const compact = viewportWidth < 820;
  return {
    globeSegments: compact ? 56 : 96,
    tubularSegments: compact ? 180 : 320,
    dprCap: compact ? 1.5 : 2,
    antialias: !compact,
  };
}
