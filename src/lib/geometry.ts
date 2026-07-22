type Point = [number, number];

export function haversineDistance(p1: Point, p2: Point): number {
  const R = 6371e3;
  const lat1 = (p1[1] * Math.PI) / 180;
  const lat2 = (p2[1] * Math.PI) / 180;
  const dLat = ((p2[1] - p1[1]) * Math.PI) / 180;
  const dLon = ((p2[0] - p1[0]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function closestPointOnSegment(
  p: Point,
  a: Point,
  b: Point
): { point: Point; t: number; distance: number } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];

  if (dx === 0 && dy === 0) {
    return { point: a, t: 0, distance: haversineDistance(p, a) };
  }

  // Projection for local geometry
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const closest: Point = [a[0] + clampedT * dx, a[1] + clampedT * dy];

  return {
    point: closest,
    t: clampedT,
    distance: haversineDistance(p, closest),
  };
}

export function sliceLineString(
  coords: Point[],
  startTarget: Point,
  endTarget: Point
): Point[] {
  if (coords.length < 2) return coords;

  let bestStartIndex = 0;
  let minStartDist = Infinity;
  let startProj: Point = coords[0];

  for (let i = 0; i < coords.length - 1; i++) {
    const res = closestPointOnSegment(startTarget, coords[i], coords[i + 1]);
    if (res.distance < minStartDist) {
      minStartDist = res.distance;
      bestStartIndex = i;
      startProj = res.point;
    }
  }

  let bestEndIndex = bestStartIndex;
  let minEndDist = Infinity;
  let endProj: Point = coords[coords.length - 1];

  for (let i = bestStartIndex; i < coords.length - 1; i++) {
    const res = closestPointOnSegment(endTarget, coords[i], coords[i + 1]);
    if (res.distance < minEndDist) {
      minEndDist = res.distance;
      bestEndIndex = i;
      endProj = res.point;
    }
  }

  if (bestStartIndex === bestEndIndex) {
    const a = coords[bestStartIndex];
    const distStartToA = haversineDistance(startProj, a);
    const distEndToA = haversineDistance(endProj, a);

    if (distStartToA <= distEndToA) {
      return [startProj, endProj];
    } else {
      return [startProj, endProj]; // Order always goes from startProj to endProj in our sequence
    }
  }

  const result: Point[] = [];
  result.push(startProj);
  for (let i = bestStartIndex + 1; i <= bestEndIndex; i++) {
    result.push(coords[i]);
  }
  result.push(endProj);

  // Clean up duplicate or very close points
  return result.filter((pt, i, arr) => {
    if (i === 0) return true;
    return haversineDistance(pt, arr[i - 1]) > 1.5;
  });
}
