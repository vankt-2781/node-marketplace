// QT5 — giá tiền: giá là số nguyên dương, đơn vị VND.
function formatPrice(price) {
  if (!Number.isInteger(price) || price <= 0) {
    throw new RangeError(`QT5: giá phải là số nguyên dương, nhận được ${price}`);
  }
  return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
}

module.exports = { formatPrice, CURRENCY: 'VND' };
