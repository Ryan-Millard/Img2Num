export default function compareSemver(a, b) {
  const parts = (v) => v.split(".").map((n) => parseInt(n, 10) || 0);
  const [aMaj, aMin, aPat] = parts(a);
  const [bMaj, bMin, bPat] = parts(b);
  return bMaj - aMaj || bMin - aMin || bPat - aPat;
}
