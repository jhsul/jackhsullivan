const BLOCK_SIZE = 0.5;
const CHAIKIN_SUBDIVISIONS = 4;
const DURATION_SCALE = 100;

const chaikin = (start, midpoint, dest) => {
  const points = _chaikin([start, midpoint, dest], CHAIKIN_SUBDIVISIONS, dest);
  //points.push(dest);
  return points;
};

const _chaikin = (points, subdivisions, dest) => {
  if (subdivisions === 1) return points;
  const newPoints = [];

  points.forEach((point, idx) => {
    if (idx === points.length - 1) return;
    const nextPoint = points[idx + 1];

    const q = addVecs(scaleVec(point, 0.75), scaleVec(nextPoint, 0.25));
    const r = addVecs(scaleVec(point, 0.25), scaleVec(nextPoint, 0.75));

    newPoints.push(q, r);
  });
  newPoints.push(dest);
  return _chaikin(newPoints, subdivisions - 1, dest);
};

const makePiece = ({ type, side, x, y, rotation }) => {
  //console.log(`Adding ${type} piece`);
  const piece = pieces[type];
  const scene = document.querySelector("a-scene");
  const entity = document.createElement("a-entity");

  piece.blocks.forEach(([x, y]) => {
    //console.log(`Adding (${x}, ${y}) block`);

    const box = document.createElement("a-box");
    box.setAttribute("geometry", {
      primitive: "box",
      height: BLOCK_SIZE,
      width: BLOCK_SIZE,
      depth: BLOCK_SIZE,
    });
    box.setAttribute("material", "color", piece.color);

    box.object3D.position.set(-BLOCK_SIZE * x, 0, -BLOCK_SIZE * y);

    entity.appendChild(box);
  });

  entity.object3D.rotation.y = THREE.Math.degToRad(rotation);
  //entity.object3D.position.set(...tileToWorldCoords({ x, y }));

  const dest = tileToWorldCoords({ x, y });
  const start =
    side === "right"
      ? tileToWorldCoords({ x: 3, y: 10 })
      : tileToWorldCoords({ x: 10, y: 3 });

  const midpoint = {
    x: (dest.x + start.x) / 2,
    y: 6,
    z: (dest.z + start.z) / 2,
  };

  const points = chaikin(start, midpoint, dest);
  //console.log(points);

  points.forEach((point, idx) => {
    if (idx === points.length - 1) return;

    const nextPoint = points[idx + 1];
    const dist = distance(point, nextPoint);
    //console.log(`Distance from ${point}->${nextPoint} = ${dist}`);
    entity.setAttribute(`animation__${idx}`, {
      property: "position",
      to: nextPoint,
      from: point,
      dur: 50 * dist,
      startEvents: idx === 0 ? null : `animationcomplete__${idx - 1}`,
      easing: "linear",
      autoplay: idx === 0,
    });
  });

  scene.appendChild(entity);
};

const tileToWorldCoords = ({ x, y }) => {
  return {
    x: BLOCK_SIZE * (-x + 3.5),
    y: BLOCK_SIZE * 0.5,
    z: BLOCK_SIZE * (-y - 2.5),
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const pieces = [...board];
  shuffle(pieces);
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    makePiece({ ...piece, side: i % 2 === 0 ? "right" : "left" });
    await sleep(1000);
  }

  //makePiece({ type: "I", isRight: true, dest: { x: 3, y: 0 } });
  //makePiece({ type: "Z", isRight: false, dest: { x: 0, y: 0 } });
  //makePiece({ type: "Z", side: "left" });
};

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};
