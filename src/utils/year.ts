const firstYear = 2019;
const lastYear = new Date().getFullYear() + 1;

export default Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => String(firstYear + index),
);
