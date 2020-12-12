export const findAngle = (xx: number, yy: number, tx: number, ty: number) => {
  let q = 0;
  const v = Math.abs(Math.round(tx - xx));
  if (v === 0) {
    if (tx === ty && ty > yy) {
      q = Math.PI;
    }
    if (tx === xx && ty < yy) {
      q = 0;
    }
  } else {
    const z = Math.abs(Math.round(ty - yy));
    q = Math.atan(z / v);

    if (tx > xx) {
      if (ty > yy) {
        q += Math.PI / 2;
      } else if (ty < yy) {
        q -= Math.PI / 2;
      } else if (ty === yy) {
        q = Math.PI / 2;
      }
    }

    if (tx < xx) {
      if (ty > yy) {
        q -= Math.PI * 1.5;
      } else if (ty < yy) {
        q += Math.PI * 1.5;
      } else if (ty === yy) {
        q = Math.PI * 1.5;
      }
    }

    if (tx === xx) {
      if (ty > yy) {
        q = Math.PI / 2;
      } else if (ty < yy) {
        q = 0;
      }
    }
  }
  return q;
};

export const findAngleInt = (xx: number, yy: number, tx: number, ty: number): number => {
  let i = Math.round(findAngle(xx, yy, tx, ty) / Math.PI * 128 + 256);
  while (i < 0) {
    i += 256;
  }
  return i & 255;
};
