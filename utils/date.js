function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatYMD(d) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function todayYMD() {
  return formatYMD(new Date());
}

module.exports = {
  formatYMD,
  todayYMD,
};

