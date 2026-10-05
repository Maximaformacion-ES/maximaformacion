/**
 * Resumen del producto que pinta la página de compra directa. Lo construye el
 * servidor a partir de un Program (Strapi) o de un MaxymiaCourse y es lo
 * único que el cliente necesita: título, precio, imagen y los datos para
 * llamar a /api/checkout.
 */
export interface PurchaseItem {
  kind: 'program' | 'maxymia';
  slug: string;
  title: string;
  image: string | null;
  price: number;
  originalPrice?: number | null;
  isPro: boolean;
  haveDiscount: boolean;
  /** 'Master' | 'Curso' para programas; undefined en Maxymia (se trata como Curso). */
  type?: 'Master' | 'Curso';
  /** documentId (programa) o id (Maxymia): la clave que usa useUserCampus.hasAccess. */
  accessId: string;
  /** Cuerpo que se envía a POST /api/checkout. */
  checkoutBody: Record<string, string>;
  /** Ficha del producto (volver atrás). */
  fichaHref: string;
  /** Ruta del curso ya comprado (si el usuario ya tiene acceso). */
  accesoHref: string;
  /** Ruta de esta misma página (para volver tras login/registro). */
  selfPath: string;
  /** Datos secundarios para el resumen. */
  details: { label: string; value: string }[];
}
