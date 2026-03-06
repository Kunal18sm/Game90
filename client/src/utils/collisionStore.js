export const walkables = [];
export const obstacles = [];

export const addWalkable = (obj) => {
  if (obj && !walkables.includes(obj)) walkables.push(obj);
};
export const removeWalkable = (obj) => {
  const i = walkables.indexOf(obj);
  if (i > -1) walkables.splice(i, 1);
};

export const addObstacle = (obj) => {
  if (obj && !obstacles.includes(obj)) obstacles.push(obj);
};
export const removeObstacle = (obj) => {
  const i = obstacles.indexOf(obj);
  if (i > -1) obstacles.splice(i, 1);
};
