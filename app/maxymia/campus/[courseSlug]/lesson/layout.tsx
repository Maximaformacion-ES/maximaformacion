import CampusChrome from '../../CampusChrome';

// El player de lección y el examen siempre van dentro del chrome del campus
// (cabecera compacta oscura); el acceso lo valida cada página en servidor.
export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return <CampusChrome>{children}</CampusChrome>;
}
