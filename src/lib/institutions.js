// Instituciones de procedencia. "UNAP" se guarda como institución propia (pide escuela profesional);
// el resto se guarda por nombre. Para agregar una, basta con sumarla a la lista que corresponda.
export const OTHER_INSTITUTION = '__otra__'

export const institutionGroups = [
  {
    group: 'Universidad del Altiplano',
    items: [{ value: 'UNAP', label: 'UNAP · Universidad Nacional del Altiplano de Puno' }],
  },
  {
    group: 'Universidades de Puno y la región',
    items: [
      'UANCV · Universidad Andina Néstor Cáceres Velásquez',
      'UNAJ · Universidad Nacional de Juliaca',
      'UPeU · Universidad Peruana Unión',
      'UPSC · Universidad Privada San Carlos',
      'UNSAAC · Universidad Nacional de San Antonio Abad del Cusco',
      'UNSA · Universidad Nacional de San Agustín de Arequipa',
      'UCSM · Universidad Católica de Santa María',
      'UCSP · Universidad Católica San Pablo',
      'UNJBG · Universidad Nacional Jorge Basadre Grohmann',
      'UNAM · Universidad Nacional de Moquegua',
      'UNAMAD · Universidad Nacional Amazónica de Madre de Dios',
    ].map((label) => ({ value: label, label })),
  },
  {
    group: 'Universidades del Perú',
    items: [
      'UNMSM · Universidad Nacional Mayor de San Marcos',
      'UNI · Universidad Nacional de Ingeniería',
      'UNALM · Universidad Nacional Agraria La Molina',
      'PUCP · Pontificia Universidad Católica del Perú',
      'UPC · Universidad Peruana de Ciencias Aplicadas',
      'UTP · Universidad Tecnológica del Perú',
      'UCV · Universidad César Vallejo',
      'UPN · Universidad Privada del Norte',
      'USMP · Universidad de San Martín de Porres',
      'Universidad Continental',
      'Universidad de Lima',
      'Universidad del Pacífico',
    ].map((label) => ({ value: label, label })),
  },
  {
    group: 'Institutos y escuelas superiores',
    items: [
      'IESTP Puno · Instituto de Educación Superior Tecnológico Público Puno',
      'IESTP Juliaca · Instituto de Educación Superior Tecnológico Público Juliaca',
      'IESPP Puno · Instituto de Educación Superior Pedagógico Público Puno',
      'IESPP Juliaca · Instituto de Educación Superior Pedagógico Público Juliaca',
      'SENATI',
      'TECSUP',
      'Cibertec',
      'IDAT',
    ].map((label) => ({ value: label, label })),
  },
  {
    group: 'Otra',
    items: [{ value: OTHER_INSTITUTION, label: 'Otra institución (escribir el nombre)' }],
  },
]
