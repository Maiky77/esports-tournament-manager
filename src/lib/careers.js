// Carreras profesionales para estudiantes de otras universidades e institutos.
// (La UNAP usa su propia lista de escuelas profesionales, en Inscription.jsx.)
export const OTHER_CAREER = '__otra_carrera__'

const list = (names) => names.map((label) => ({ value: label, label }))

export const careerGroups = [
  {
    group: 'Ingenierías y tecnología',
    items: list([
      'Ingeniería de Sistemas', 'Ingeniería de Software', 'Ingeniería Informática', 'Ciencias de la Computación',
      'Ingeniería Civil', 'Ingeniería Industrial', 'Ingeniería Mecánica', 'Ingeniería Mecánica Eléctrica',
      'Ingeniería Electrónica', 'Ingeniería Eléctrica', 'Ingeniería de Minas', 'Ingeniería Geológica',
      'Ingeniería Metalúrgica', 'Ingeniería Química', 'Ingeniería Ambiental', 'Ingeniería Agroindustrial',
      'Ingeniería Agrónoma', 'Ingeniería de Telecomunicaciones', 'Ingeniería Estadística e Informática',
      'Ingeniería de Inteligencia Artificial y Ciencia de Datos', 'Arquitectura', 'Computación e Informática',
      'Mecánica Automotriz', 'Electrotecnia Industrial', 'Mecánica de Producción', 'Construcción Civil',
    ]),
  },
  {
    group: 'Salud y ciencias',
    items: list([
      'Medicina Humana', 'Enfermería', 'Odontología', 'Obstetricia', 'Nutrición Humana', 'Psicología',
      'Farmacia y Bioquímica', 'Tecnología Médica', 'Medicina Veterinaria y Zootecnia', 'Biología',
      'Física', 'Matemática', 'Estadística', 'Enfermería Técnica', 'Farmacia Técnica',
    ]),
  },
  {
    group: 'Negocios y derecho',
    items: list([
      'Administración', 'Administración de Empresas', 'Administración de Negocios Internacionales',
      'Contabilidad', 'Ciencias Contables y Financieras', 'Economía', 'Marketing', 'Derecho',
      'Turismo', 'Hotelería y Gastronomía', 'Gestión Pública', 'Secretariado Ejecutivo',
    ]),
  },
  {
    group: 'Educación, ciencias sociales y arte',
    items: list([
      'Educación Inicial', 'Educación Primaria', 'Educación Secundaria', 'Educación Física',
      'Ciencias de la Comunicación', 'Trabajo Social', 'Sociología', 'Antropología', 'Arqueología',
      'Música', 'Artes Plásticas', 'Danza', 'Diseño Gráfico', 'Diseño de Interiores',
    ]),
  },
  { group: 'Otra', items: [{ value: OTHER_CAREER, label: 'Otra carrera (escribir el nombre)' }] },
]
