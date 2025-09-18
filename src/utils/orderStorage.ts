// Fetch assigned orders for the logged-in driver from backend
export async function fetchAssignedOrdersForDriver(): Promise<{ success: boolean; orders: Order[]; error?: string }> {
  try {
  const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/driver/orders`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch assigned orders');
    const data = await res.json();
    if (!data.success || !Array.isArray(data.orders)) throw new Error('Invalid response');
  // Do not overwrite local storage here; let the caller handle merging and saving
    return { success: true, orders: data.orders };
  } catch (err: unknown) {
    let msg = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
      msg = (err as { message: string }).message;
    }
    return { success: false, orders: [], error: msg };
  }
}
// Utility for managing orders in local storage

export interface Order {
  orderId?: string | number;
  order_id?: string | number; // backend business order id
  id?: number;
  email?: string;
  customerName?: string;
  customer_name?: string;
  address?: string;
  location?: { lat?: number; lng?: number };
  location_lat?: number;
  location_lng?: number;
  cylinderType: string;
  cylinder_type?: string;
  filled?: string;
  uniqueCode?: string | number;
  unique_code?: string;
  status?: string;
  date?: string;
  amountPaid?: number;
  amount_paid?: number;
  notes?: string;
  payment?: string;
  payment_method?: string;
  serviceType?: string;
  service_type?: string;
  timeSlot?: string;
  time_slot?: string;
  deliveryWindow?: string;
  delivery_window?: string;
  pickupFee?: number;
  failedNote?: string;
  created_at?: string;
}

export const ORDER_STORAGE_KEY = 'tapgas_orders';

export function getOrders() {
  const raw = localStorage.getItem(ORDER_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // Filter out orders missing orderId or cylinderType
    return Array.isArray(parsed)
      ? parsed
          .map((o) => ({
              ...o,
              orderId: o.orderId ?? o.order_id ?? undefined,
          }))
          .filter((o) => (typeof o.cylinderType === 'string' && o.cylinderType.length > 0) && (typeof o.orderId === 'string' || typeof o.orderId === 'number'))
      : [];
  } catch {
    return [];
  }
}


// Save a new order, always set orderId from backend order_id if present
export function saveOrder(order: Order) {
  const orders = getOrders();
  // Always use backend's uniqueCode if present
  const normalizedOrder = {
    ...order,
    orderId: order.orderId ?? order.order_id ?? undefined,
    cylinderType: order.cylinderType ?? order.cylinder_type ?? '',
    serviceType: order.serviceType ?? order.service_type ?? '',
    timeSlot: order.timeSlot ?? order.time_slot ?? '',
    deliveryWindow: order.deliveryWindow ?? order.delivery_window ?? '',
    uniqueCode: order.uniqueCode ?? order.unique_code ?? '',
    notes: order.notes ?? order.failedNote ?? '',
  };
  // Remove any order with the same uniqueCode (string or number match)
  const filteredOrders = orders.filter(
    o => String(o.uniqueCode ?? o.unique_code ?? '') !== String(normalizedOrder.uniqueCode)
  );
  filteredOrders.unshift(normalizedOrder); // newest first
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(filteredOrders));
}

// After placing order and receiving backend order_id, update local order
export function updateOrderWithBackendId(localUniqueCode: string | number, backendOrderId: string | number) {
  let orders = getOrders();
  orders = orders.map(order => {
    if (order.uniqueCode === localUniqueCode) {
      return { ...order, orderId: backendOrderId };
    }
    return order;
  });
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

// Merge new orders into local storage, avoiding duplicates by orderId
export function mergeOrders(newOrders: Partial<Order>[]) {
  // Map backend fields to frontend, handle missing/null gracefully
  const normalized = newOrders.map((o) => {
    // Compose location if lat/lng present
    let location = undefined;
    if (o.location_lat !== undefined && o.location_lng !== undefined) {
      location = { lat: o.location_lat, lng: o.location_lng };
    }
    return {
      ...o,
      orderId: o.orderId ?? o.order_id ?? undefined,
      customerName: o.customerName ?? o.customer_name ?? '',
      cylinderType: o.cylinderType ?? o.cylinder_type ?? '',
      serviceType: o.serviceType ?? o.service_type ?? '',
      timeSlot: o.timeSlot ?? o.time_slot ?? '',
      deliveryWindow: o.deliveryWindow ?? o.delivery_window ?? '',
      uniqueCode: o.uniqueCode ?? o.unique_code ?? '',
      amountPaid: o.amountPaid ?? o.amount_paid ?? undefined,
      payment: o.payment ?? o.payment_method ?? '',
      notes: o.notes ?? o.failedNote ?? '',
      location,
    };
  });
  const existing = getOrders();
  // Build maps for fast lookup by DB id and uniqueCode
  const existingById = new Map<number, Order>();
  const existingByUniqueCode = new Map<number | string, Order>();
  existing.forEach((o: Order) => {
    if (o.id !== undefined) existingById.set(o.id, o);
    if (o.uniqueCode !== undefined) existingByUniqueCode.set(o.uniqueCode, o);
  });

  // For each backend order, replace any local order with same DB id or uniqueCode
  let merged = [...existing];
  normalized.forEach((order) => {
    // Replace by DB id if present
    if (order.id !== undefined && existingById.has(order.id)) {
      merged = merged.map(o => (o.id === order.id ? order : o));
    }
    // Replace by uniqueCode if present and not already replaced
    else if (order.uniqueCode !== undefined && existingByUniqueCode.has(order.uniqueCode)) {
      merged = merged.map(o => (o.uniqueCode === order.uniqueCode ? order : o));
    }
    // If not replaced and orderId is unique, add it
    else if (order.orderId && !merged.some(o => o.orderId === order.orderId)) {
      merged.unshift(order);
    }
  });
  // Remove any duplicates by orderId, keep first occurrence (backend order preferred)
  const seen = new Set();
  merged = merged.filter(o => {
    if (!o.orderId) return false;
    if (seen.has(o.orderId)) return false;
    seen.add(o.orderId);
    return true;
  });
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(merged));
}

// Fetch all orders and drivers from backend (admin only)
export async function syncOrdersFromBackend(): Promise<{ success: boolean; count: number; drivers?: string[]; error?: string }> {
  try {
  const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/orders`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    if (!data.success || !Array.isArray(data.orders)) throw new Error('Invalid response');
    mergeOrders(data.orders);
    if (Array.isArray(data.drivers)) {
      localStorage.setItem('tapgas_drivers', JSON.stringify(data.drivers));
    }
    return { success: true, count: data.orders.length, drivers: data.drivers };
  } catch (err: unknown) {
    let msg = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
      msg = (err as { message: string }).message;
    }
    return { success: false, count: 0, error: msg };
  }
}


