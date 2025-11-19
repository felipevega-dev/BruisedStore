/**
 * Utilidades para el Sistema de Logs de Actividad de Administradores
 * Registra todas las acciones importantes realizadas por admins en el panel
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { AdminAction, AdminLog } from '@/types';

/**
 * Registra una acción del administrador en Firestore
 * 
 * @param action - Tipo de acción realizada
 * @param adminEmail - Email del administrador
 * @param adminUid - UID del administrador
 * @param metadata - Información adicional según el tipo de acción
 */
export async function logAdminAction(
  action: AdminAction,
  adminEmail: string,
  adminUid: string,
  metadata?: AdminLog['metadata']
): Promise<void> {
  try {
    await addDoc(collection(db, 'adminLogs'), {
      action,
      adminEmail,
      adminUid,
      timestamp: serverTimestamp(),
      metadata: metadata || {},
    });
    
    console.log(`[Admin Log] ${action} by ${adminEmail}`, metadata);
  } catch (error) {
    console.error('Error logging admin action:', error);
    // No lanzamos el error para no interrumpir la operación principal
  }
}

/**
 * Helpers para acciones comunes
 */

export const AdminLogHelpers = {
  /**
   * Log cambio de estado de orden normal
   */
  logOrderStatusChange: async (
    adminEmail: string,
    adminUid: string,
    orderId: string,
    orderNumber: string,
    oldStatus: string,
    newStatus: string
  ) => {
    await logAdminAction('order_status_updated', adminEmail, adminUid, {
      orderId,
      orderNumber,
      oldStatus,
      newStatus,
      description: `Estado cambiado de "${oldStatus}" a "${newStatus}"`,
    });
  },

  /**
   * Log cambio de estado de orden personalizada
   */
  logCustomOrderStatusChange: async (
    adminEmail: string,
    adminUid: string,
    orderId: string,
    oldStatus: string,
    newStatus: string
  ) => {
    await logAdminAction('custom_order_status_updated', adminEmail, adminUid, {
      orderId,
      oldStatus,
      newStatus,
      description: `Estado de obra personalizada cambiado de "${oldStatus}" a "${newStatus}"`,
    });
  },

  /**
   * Log creación de pintura
   */
  logPaintingCreated: async (
    adminEmail: string,
    adminUid: string,
    paintingId: string,
    paintingTitle: string
  ) => {
    await logAdminAction('painting_created', adminEmail, adminUid, {
      paintingId,
      paintingTitle,
      description: `Obra "${paintingTitle}" agregada al catálogo`,
    });
  },

  /**
   * Log actualización de pintura
   */
  logPaintingUpdated: async (
    adminEmail: string,
    adminUid: string,
    paintingId: string,
    paintingTitle: string
  ) => {
    await logAdminAction('painting_updated', adminEmail, adminUid, {
      paintingId,
      paintingTitle,
      description: `Obra "${paintingTitle}" actualizada`,
    });
  },

  /**
   * Log eliminación de pintura
   */
  logPaintingDeleted: async (
    adminEmail: string,
    adminUid: string,
    paintingId: string,
    paintingTitle: string
  ) => {
    await logAdminAction('painting_deleted', adminEmail, adminUid, {
      paintingId,
      paintingTitle,
      description: `Obra "${paintingTitle}" eliminada del catálogo`,
    });
  },

  /**
   * Log aprobación de review
   */
  logReviewApproved: async (
    adminEmail: string,
    adminUid: string,
    reviewId: string,
    reviewerName: string
  ) => {
    await logAdminAction('review_approved', adminEmail, adminUid, {
      reviewId,
      reviewerName,
      description: `Reseña de "${reviewerName}" aprobada`,
    });
  },

  /**
   * Log rechazo de review
   */
  logReviewRejected: async (
    adminEmail: string,
    adminUid: string,
    reviewId: string,
    reviewerName: string
  ) => {
    await logAdminAction('review_rejected', adminEmail, adminUid, {
      reviewId,
      reviewerName,
      description: `Reseña de "${reviewerName}" rechazada`,
    });
  },

  /**
   * Log eliminación de review
   */
  logReviewDeleted: async (
    adminEmail: string,
    adminUid: string,
    reviewId: string,
    reviewerName: string
  ) => {
    await logAdminAction('review_deleted', adminEmail, adminUid, {
      reviewId,
      reviewerName,
      description: `Reseña de "${reviewerName}" eliminada`,
    });
  },

  /**
   * Log creación de cupón
   */
  logCouponCreated: async (
    adminEmail: string,
    adminUid: string,
    couponId: string,
    couponCode: string
  ) => {
    await logAdminAction('coupon_created', adminEmail, adminUid, {
      couponId,
      couponCode,
      description: `Cupón "${couponCode}" creado`,
    });
  },

  /**
   * Log actualización de cupón
   */
  logCouponUpdated: async (
    adminEmail: string,
    adminUid: string,
    couponId: string,
    couponCode: string
  ) => {
    await logAdminAction('coupon_updated', adminEmail, adminUid, {
      couponId,
      couponCode,
      description: `Cupón "${couponCode}" actualizado`,
    });
  },

  /**
   * Log eliminación de cupón
   */
  logCouponDeleted: async (
    adminEmail: string,
    adminUid: string,
    couponId: string,
    couponCode: string
  ) => {
    await logAdminAction('coupon_deleted', adminEmail, adminUid, {
      couponId,
      couponCode,
      description: `Cupón "${couponCode}" eliminado`,
    });
  },

  /**
   * Log publicación de blog post
   */
  logBlogPostPublished: async (
    adminEmail: string,
    adminUid: string,
    postId: string,
    postTitle: string,
    postSlug: string
  ) => {
    await logAdminAction('blog_post_published', adminEmail, adminUid, {
      postId,
      postTitle,
      postSlug,
      description: `Post "${postTitle}" publicado`,
    });
  },

  /**
   * Log actualización de configuración general
   */
  logGeneralSettingsUpdated: async (
    adminEmail: string,
    adminUid: string
  ) => {
    await logAdminAction('general_settings_updated', adminEmail, adminUid, {
      description: 'Configuración general del sitio actualizada',
    });
  },

  /**
   * Log actualización de configuración de música
   */
  logMusicSettingsUpdated: async (
    adminEmail: string,
    adminUid: string
  ) => {
    await logAdminAction('music_settings_updated', adminEmail, adminUid, {
      description: 'Configuración de música actualizada',
    });
  },

  /**
   * Log actualización de configuración del home
   */
  logHomeSettingsUpdated: async (
    adminEmail: string,
    adminUid: string
  ) => {
    await logAdminAction('home_settings_updated', adminEmail, adminUid, {
      description: 'Configuración de la página principal actualizada',
    });
  },
};
