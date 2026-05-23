export function activeIndex(progress, centers) {
  let best = 0;
  let bestDistance = Infinity;

  centers.forEach((center, index) => {
    const distance = Math.abs(progress - center);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });

  return best;
}
