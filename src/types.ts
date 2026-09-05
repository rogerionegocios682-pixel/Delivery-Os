export type RoleType =
  | 'MASTER'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'GERENTE'
  | 'VENDEDOR'
  | 'CAIXA'
  | 'ESTOQUE'
  | 'OPERADOR'
  | 'ENTREGADOR';

export type OrderStatus =
  | 'novo'
  | 'confirmado'
  | 'preparando'
  | 'pronto'
  | 'aguardando_despacho'
  | 'despachado'
  | 'em_rota'
  | 'entregue'
  | 'cancelado';

export type DriverStatus = 'AVAILABLE' | 'DELIVERING' | 'PAUSED' | 'OFFLINE';

export type StoreStatus = 'active' | 'blocked' | 'pending' | 'suspended';

export interface Store {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  status: StoreStatus;
  createdAt?: string;
}

export interface StoreSettings {
  id: string;
  storeId: string;
  minOrderValue: string;
  defaultDeliveryFee: string;
  autoDispatch: boolean;
  soundAlerts: boolean;
  businessHours: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: RoleType;
  storeId?: string;
  isMaster: boolean;
}

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  reference?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: string;
  category: string;
  status: string;
  imageUrl?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  notes?: string;
}

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  status: OrderStatus;
  total: string;
  subtotal: string;
  deliveryFee: string;
  discount: string;
  paymentMethod: string;
  address: string;
  phone: string;
  notes?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface DeliveryDriver {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  document?: string;
  vehicleType: string;
  vehiclePlate?: string;
  status: DriverStatus;
  paymentModel: 'fixed' | 'per_delivery' | 'per_km' | 'percentage' | 'hybrid';
  baseRate: string;
  perKmRate: string;
  location?: {
    latitude: string;
    longitude: string;
    accuracy?: string;
    timestamp?: string;
  };
}

export interface DriverShift {
  id: string;
  storeId: string;
  driverId: string;
  shiftType: 'fixa' | 'variavel' | 'folga' | 'ausencia' | 'troca';
  startTime: string;
  endTime: string;
  slots: number;
  status: string;
}

export interface Dispatch {
  id: string;
  storeId: string;
  orderId: string;
  driverId: string;
  dispatchedBy: string;
  status: string;
  dispatchedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface DeliveryRoute {
  id: string;
  storeId: string;
  driverId?: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  totalOrders: number;
  estimatedTimeMin: number;
  createdAt: string;
  orders?: {
    id: string;
    routeId: string;
    orderId: string;
    stopSequence: number;
    status: string;
  }[];
}

export interface CashRegister {
  id: string;
  storeId: string;
  openedBy: string;
  closedBy?: string;
  openingBalance: string;
  closingBalance?: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export interface CashMovement {
  id: string;
  storeId: string;
  cashRegisterId: string;
  type: 'inflow' | 'outflow' | 'suprimento' | 'sangria';
  amount: string;
  description: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface AccountPayable {
  id: string;
  storeId: string;
  description: string;
  category: string;
  amount: string;
  dueDate: string;
  paidAt?: string;
  status: 'pending' | 'paid' | 'overdue';
  supplier?: string;
}

export interface AccountReceivable {
  id: string;
  storeId: string;
  description: string;
  customerId?: string;
  amount: string;
  dueDate: string;
  receivedAt?: string;
  status: 'pending' | 'received' | 'overdue';
}

export interface DriverPayment {
  id: string;
  storeId: string;
  driverId: string;
  periodStart: string;
  periodEnd: string;
  deliveriesCount: number;
  totalAmount: string;
  status: 'pending' | 'paid';
  paidAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  storeId?: string;
  action: string;
  tableName?: string;
  recordId?: string;
  oldData?: string;
  newData?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  storeId: string;
  senderId: string;
  senderName: string;
  channel: string;
  content: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  maxUsers: number;
  maxDrivers: number;
  maxOrders: number;
  features?: string;
  status: string;
}
