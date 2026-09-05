import { pgTable, text, integer, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

// 1. TENANCY
export const stores = pgTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cnpj: text('cnpj'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  logoUrl: text('logo_url'),
  status: text('status').notNull().default('active'), // active, blocked, pending, suspended
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const storeSettings = pgTable('store_settings', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  minOrderValue: numeric('min_order_value', { precision: 10, scale: 2 }).default('0.00'),
  defaultDeliveryFee: numeric('default_delivery_fee', { precision: 10, scale: 2 }).default('7.00'),
  autoDispatch: boolean('auto_dispatch').default(false),
  soundAlerts: boolean('sound_alerts').default(true),
  businessHours: text('business_hours').default('18:00 - 23:30'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  maxUsers: integer('max_users').notNull().default(5),
  maxDrivers: integer('max_drivers').notNull().default(10),
  maxOrders: integer('max_orders').notNull().default(500),
  features: text('features'),
  status: text('status').notNull().default('active'),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  planId: text('plan_id').notNull().references(() => plans.id),
  status: text('status').notNull().default('active'), // trial, active, past_due, canceled, expired, suspended
  startedAt: timestamp('started_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. AUTH & PROFILES & PERMISSIONS
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('OPERADOR'), // MASTER, SUPER_ADMIN, ADMIN, GERENTE, VENDEDOR, CAIXA, ESTOQUE, OPERADOR, ENTREGADOR
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const storeUsers = pgTable('store_users', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  userId: text('user_id').notNull().references(() => profiles.id),
  role: text('role').notNull().default('OPERADOR'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
});

export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  module: text('module').notNull(),
  description: text('description'),
});

export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  permission: text('permission').notNull(),
});

// 3. AUDIT & LOGS
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  storeId: text('store_id'),
  action: text('action').notNull(), // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, CANCEL, PAYMENT, CHANGE_PERMISSION, CREATE_USER, BLOCK_USER, ACCESS_STORE, BLOCK_STORE, UNBLOCK_STORE
  tableName: text('table_name'),
  recordId: text('record_id'),
  oldData: text('old_data'),
  newData: text('new_data'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const loginLogs = pgTable('login_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  storeId: text('store_id'),
  loginAt: timestamp('login_at').defaultNow(),
  logoutAt: timestamp('logout_at'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  success: boolean('success').default(true),
  failureReason: text('failure_reason'),
});

// 4. COMMERCIAL
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address').notNull(),
  number: text('number'),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  city: text('city'),
  reference: text('reference'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull().default('Geral'),
  status: text('status').notNull().default('active'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  status: text('status').notNull().default('novo'), // novo, confirmado, preparando, pronto, aguardando_despacho, despachado, em_rota, entregue, cancelado
  total: numeric('total', { precision: 10, scale: 2 }).notNull().default('0.00'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull().default('0.00'),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).notNull().default('0.00'),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  paymentMethod: text('payment_method').notNull().default('pix'), // pix, cartao_credito, cartao_debito, dinheiro
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  orderId: text('order_id').notNull().references(() => orders.id),
  method: text('method').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. DELIVERY & LOGISTICS
export const deliveryDrivers = pgTable('delivery_drivers', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  document: text('document'),
  vehicleType: text('vehicle_type').notNull().default('moto'), // moto, bike, carro
  vehiclePlate: text('vehicle_plate'),
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, DELIVERING, PAUSED, OFFLINE
  paymentModel: text('payment_model').notNull().default('per_delivery'), // fixed, per_delivery, per_km, percentage, hybrid
  baseRate: numeric('base_rate', { precision: 10, scale: 2 }).default('7.00'),
  perKmRate: numeric('per_km_rate', { precision: 10, scale: 2 }).default('1.50'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const driverShifts = pgTable('driver_shifts', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  driverId: text('driver_id').references(() => deliveryDrivers.id),
  shiftType: text('shift_type').notNull().default('fixa'), // fixa, variavel, folga, ausencia, troca
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  slots: integer('slots').default(1),
  status: text('status').notNull().default('confirmed'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dispatches = pgTable('dispatches', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  orderId: text('order_id').notNull().references(() => orders.id),
  driverId: text('driver_id').notNull().references(() => deliveryDrivers.id),
  dispatchedBy: text('dispatched_by').notNull(),
  status: text('status').notNull().default('active'),
  dispatchedAt: timestamp('dispatched_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
});

export const deliveryRoutes = pgTable('delivery_routes', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  driverId: text('driver_id').references(() => deliveryDrivers.id),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'), // draft, in_progress, completed, cancelled
  totalOrders: integer('total_orders').default(0),
  estimatedTimeMin: integer('estimated_time_min').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const routeOrders = pgTable('route_orders', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  routeId: text('route_id').notNull().references(() => deliveryRoutes.id),
  orderId: text('order_id').notNull().references(() => orders.id),
  stopSequence: integer('stop_sequence').notNull().default(1),
  status: text('status').notNull().default('pending'),
  deliveredAt: timestamp('delivered_at'),
});

export const driverLocations = pgTable('driver_locations', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  driverId: text('driver_id').notNull().references(() => deliveryDrivers.id),
  latitude: numeric('latitude', { precision: 10, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 10, scale: 6 }).notNull(),
  accuracy: numeric('accuracy', { precision: 10, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 6. NOTIFICATIONS & COMMUNICATION
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  userId: text('user_id'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  recipientId: text('recipient_id'),
  channel: text('channel').notNull().default('operations'), // general, drivers, direct, operations
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. FINANCE
export const cashRegisters = pgTable('cash_registers', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  openedBy: text('opened_by').notNull(),
  closedBy: text('closed_by'),
  openingBalance: numeric('opening_balance', { precision: 10, scale: 2 }).notNull().default('0.00'),
  closingBalance: numeric('closing_balance', { precision: 10, scale: 2 }),
  status: text('status').notNull().default('open'), // open, closed
  openedAt: timestamp('opened_at').defaultNow(),
  closedAt: timestamp('closed_at'),
});

export const cashMovements = pgTable('cash_movements', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  cashRegisterId: text('cash_register_id').notNull().references(() => cashRegisters.id),
  type: text('type').notNull(), // inflow, outflow, suprimento, sangria
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  paymentMethod: text('payment_method').default('dinheiro'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accountsPayable = pgTable('accounts_payable', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  description: text('description').notNull(),
  category: text('category').notNull().default('Operacional'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: text('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  status: text('status').notNull().default('pending'), // pending, paid, overdue
  supplier: text('supplier'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accountsReceivable = pgTable('accounts_receivable', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  description: text('description').notNull(),
  customerId: text('customer_id').references(() => customers.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: text('due_date').notNull(),
  receivedAt: timestamp('received_at'),
  status: text('status').notNull().default('pending'), // pending, received, overdue
  createdAt: timestamp('created_at').defaultNow(),
});

export const driverPayments = pgTable('driver_payments', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  driverId: text('driver_id').notNull().references(() => deliveryDrivers.id),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  deliveriesCount: integer('deliveries_count').default(0),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // pending, paid
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const deliveryCosts = pgTable('delivery_costs', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  orderId: text('order_id').references(() => orders.id),
  driverId: text('driver_id').references(() => deliveryDrivers.id),
  costType: text('cost_type').notNull().default('frete'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
