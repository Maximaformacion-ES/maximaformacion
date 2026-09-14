// Passthrough. El chrome del campus (CampusShell) ya no se aplica aquí: lo
// aplican por ruta las layouts de cursos/, mis-cursos/, notas/,
// [courseSlug]/lesson/ y las páginas del dashboard y del curso (ver
// CampusChrome). Motivo: /maxymia/campus/[courseSlug] es una ficha PÚBLICA
// de venta cuando no hay matrícula y debe llevar el Header/Footer del sitio,
// como las fichas de /programas; solo con matrícula es "campus".
export default function CampusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
