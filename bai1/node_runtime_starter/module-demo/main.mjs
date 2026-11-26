import priceFormat from './priceFormat.cjs';

const { formatPrice, CURRENCY } = priceFormat;

console.log(formatPrice(1200000), CURRENCY);

try {
  formatPrice(-5);
} catch (err) {
  console.log(err.message);
}

console.log(import.meta.dirname);
