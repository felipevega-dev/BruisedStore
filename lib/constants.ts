/**
 * Application-wide constants
 */

/**
 * Shipping cost in CLP
 */
export const SHIPPING_COST = 5000;

/**
 * Maximum file size for image uploads (in MB)
 */
export const MAX_IMAGE_SIZE_MB = 10;

/**
 * Maximum image dimensions for uploads
 */
export const MAX_IMAGE_WIDTH = 1920;
export const MAX_IMAGE_HEIGHT = 1920;

/**
 * Image compression quality (0-1)
 */
export const IMAGE_COMPRESSION_QUALITY = 0.8;

/**
 * WhatsApp contact number (from env)
 */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

/**
 * Toast notification duration (in milliseconds)
 */
export const TOAST_DURATION = 3000;

/**
 * Admin pagination limits
 */
export const ADMIN_ITEMS_PER_PAGE = 20;

/**
 * Gallery pagination limits
 */
export const GALLERY_ITEMS_PER_PAGE = 12;

/**
 * Order status options
 */
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  WEBPAY: "webpay",
  TRANSFER: "transfer",
  CASH: "cash",
} as const;

/**
 * Custom order status options
 */
export const CUSTOM_ORDER_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

/**
 * Review rating range
 */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation (minimum digits)
 */
export const PHONE_MIN_DIGITS = 8;

/**
 * Name validation (minimum characters)
 */
export const NAME_MIN_LENGTH = 3;

/**
 * Firebase storage paths
 */
export const STORAGE_PATHS = {
  PAINTINGS: "paintings",
  CUSTOM_ORDERS: "custom-orders",
  REVIEWS: "reviews",
} as const;

/**
 * Firebase collections
 */
export const COLLECTIONS = {
  PAINTINGS: "paintings",
  ORDERS: "orders",
  CUSTOM_ORDERS: "customOrders",
  REVIEWS: "reviews",
  WISHLIST: "wishlist",
  COUPONS: "coupons",
  USERS: "users",
} as const;
