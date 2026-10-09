// Business Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
};

// Product Statuses
export const PRODUCT_STATUS = {
  AVAILABLE: 0,
  RESERVED: 1,
  SOLD: 2,
};

// Collection Request Statuses
export const COLLECTION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  COLLECTED: 'Collected',
  INSPECTING: 'Inspecting',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

// Inspection Results
export const INSPECTION_RESULT = {
  ACCEPTED_UPCYCLING: 'Accepted for Upcycling',
  ACCEPTED_MATERIAL: 'Accepted for Material',
  REJECTED: 'Rejected',
};

// Upcycling Project Statuses
export const UPCYCLING_STATUS = {
  COLLECTED: 'Collected',
  CLEANING: 'Cleaning',
  DESIGNING: 'Designing',
  PRODUCTION: 'Production',
  QUALITY_CHECK: 'Quality Check',
  READY_TO_SELL: 'Ready to Sell',
};

// Quality Check Decisions
export const QC_DECISION = {
  APPROVED: 'Approved',
  NEEDS_REVISION: 'Needs Revision',
  REJECTED: 'Rejected',
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// Payment Statuses
export const PAYMENT_STATUS = {
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
};
