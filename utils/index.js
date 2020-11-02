function getRandomColor() {
  return (Math.random() * 4294967296) >>> 0;
}

module.exports = {
  getRandomColor
};