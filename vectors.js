const scaleVec = ({ x, y, z }, s) => {
  return {
    x: x * s,
    y: y * s,
    z: z * s,
  };
};

const addVecs = (a, b) => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
};

const distance = (a, b) => {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );
};
