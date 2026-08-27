/**
 * Recursos cuyo PDF se perdió al borrarse del bucket R2 (el original vivía en el
 * WordPress viejo, en un servidor de la agencia que ya no está accesible, y no
 * hay backup recuperable — ver hilo de recuperación de agosto 2026). Mientras se
 * re-obtiene el fichero (TFMs de los autores, guías del equipo de contenido),
 * mostramos "Próximamente" en la ficha en vez de un enlace de descarga roto (404).
 *
 * TEMPORAL: al restaurar el PDF de un recurso, quita su slug de aquí. Cuando no
 * quede ninguno, borra este fichero y sus imports.
 */
export const COMING_SOON_RESOURCE_SLUGS = new Set<string>([
  'como-agregar-usuarios-a-un-curso-en-moodle',
  'como-crear-un-curso-en-moodle',
  'como-matricular-usuarios-en-moodle',
  'disena-investigaciones-con-rigor-cientifico',
  'creacion-de-aplicaciones-web-interactivas-con-shiny',
  'descubrimiento-de-patrones-de-clientes-en-la-categoria-atunes-en-el-sector-retail-a-traves-de-analisis-de-conglomerados-clustering',
  'analisis-de-factores-de-lesividad-en-los-accidentes-de-trafico-en-espana',
  'analisis-de-los-datos-de-jugadores-de-la-liga-2019-2020',
  'modelo-predictivo-de-demanda-de-atencion-de-urgencia-pediatrica',
  'resultado-de-un-experimento-para-analizar-la-influencia-del-formato-de-la-escala-de-respuesta-en-la-medicion-de-actitudes-en-encuestas-de-opinion',
  'los-3-secretos-para-aprender-estadistica-con-exito',
  'interpretacion-local-en-modelos-de-machine-learning-para-la-estimacion-del-incumplimiento-crediticio-bajo-la-regulacion-financiera-chilena',
  'analisis-cluster-con-datos-espaciales',
  'introduccion-al-paquete-dplyr',
]);

/** true si el recurso tiene su descarga rota y debe mostrar "Próximamente". */
export function isComingSoon(slug: string | undefined | null): boolean {
  return !!slug && COMING_SOON_RESOURCE_SLUGS.has(slug);
}
