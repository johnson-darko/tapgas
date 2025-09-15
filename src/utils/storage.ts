// Local storage helpers for TapGas
export const saveOrder = (order: any) => {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
};

export const getOrders = () => {
  return JSON.parse(localStorage.getItem("orders") || "[]");
};
