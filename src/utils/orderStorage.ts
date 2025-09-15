// Utility for managing orders in local storage

export interface Order {
  orderId: number;
  customerName: string;
  address: string;
  cylinderType: string;
  uniqueCode: number;
  status: string;
  date: string;
  amountPaid: number;
  location?: {
    lat: number;
    lng: number;
  };
  notes?: string;
  payment?: string;
  // New fields for LPG Gas Refill workflow
  serviceType?: 'kiosk' | 'pickup';
  timeSlot?: 'morning' | 'evening';
  deliveryWindow?: 'sameDayEvening' | 'nextMorning' | 'nextEvening';
  pickupFee?: number;
  failedNote?: string; // comment for failed delivery
}

export const ORDER_STORAGE_KEY = 'tapgas_orders';

export function getOrders() {
  const raw = localStorage.getItem(ORDER_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  const orders = getOrders();
  orders.unshift(order); // newest first
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}


export function injectDummyOrders() {
  const dummyOrders: Order[] = [
    {
      orderId: 1,
      customerName: "Alice",
      address: "Area A, 123 Main St",
      cylinderType: "Order LPG Gas Refill",
      uniqueCode: 1111,
      status: "pending",
      date: "2025-09-14",
      amountPaid: 3000,
      location: { lat: 6.5244, lng: 3.3792 },
      notes: "Leave at gate",
      payment: "Cash"
    },
    {
      orderId: 2,
      customerName: "Bob",
      address: "Area A, 123 Main St",
      cylinderType: "Buy Cylinder",
      uniqueCode: 2222,
      status: "pending",
      date: "2025-09-14",
      amountPaid: 12000,
      location: { lat: 6.5245, lng: 3.3793 },
      notes: "Call before arrival",
      payment: "Card"
    },
    {
      orderId: 3,
      customerName: "Carol",
      address: "Area B, 456 Market Rd",
      cylinderType: "Order LPG Gas Refill",
      uniqueCode: 3333,
      status: "pending",
      date: "2025-09-14",
      amountPaid: 2500,
      location: { lat: 6.5250, lng: 3.3800 },
      notes: "",
      payment: "Cash"
    },
    {
      orderId: 4,
      customerName: "Dave",
      address: "Area B, 456 Market Rd",
      cylinderType: "Buy Cylinder",
      uniqueCode: 4444,
      status: "pending",
      date: "2025-09-14",
      amountPaid: 11000,
      location: { lat: 6.5251, lng: 3.3801 },
      notes: "Ring bell twice",
      payment: "Card"
    }
  ];
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(dummyOrders));
}
