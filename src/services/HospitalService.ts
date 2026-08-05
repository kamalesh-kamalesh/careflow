import { Hospital, Doctor } from '../types';
import { ERODE_HOSPITALS, ERODE_DOCTORS } from '../data/hospitalsData';

/**
 * HospitalService utility providing access to hospital and doctor databases
 * with rich search, specialty filtering, and query capabilities.
 */

// Export base searchable data arrays
export const hospitals: Hospital[] = ERODE_HOSPITALS;
export const doctors: Doctor[] = ERODE_DOCTORS;

/**
 * Get all available hospitals.
 */
export const getAllHospitals = (customHospitals?: Hospital[]): Hospital[] => {
  return customHospitals || hospitals;
};

/**
 * Get all available doctors.
 */
export const getAllDoctors = (customDoctors?: Doctor[]): Doctor[] => {
  return customDoctors || doctors;
};

/**
 * Get all unique specialties across the doctor list.
 */
export const getAllSpecialties = (customDoctors?: Doctor[]): string[] => {
  const docList = customDoctors || doctors;
  const specialtySet = new Set<string>();
  docList.forEach(doc => {
    if (doc.specialty) {
      specialtySet.add(doc.specialty);
    }
  });
  return ['All', ...Array.from(specialtySet).sort()];
};

/**
 * Filter doctors by specific specialty.
 */
export const filterDoctorsBySpecialty = (
  specialty: string,
  customDoctors?: Doctor[]
): Doctor[] => {
  const docList = customDoctors || doctors;
  if (!specialty || specialty === 'All') {
    return docList;
  }
  const targetSpecialty = specialty.toLowerCase().trim();
  return docList.filter(
    doc => doc.specialty && doc.specialty.toLowerCase().includes(targetSpecialty)
  );
};

/**
 * Filter hospitals by specialty offered.
 */
export const filterHospitalsBySpecialty = (
  specialty: string,
  customHospitals?: Hospital[]
): Hospital[] => {
  const hospList = customHospitals || hospitals;
  if (!specialty || specialty === 'All') {
    return hospList;
  }
  const targetSpecialty = specialty.toLowerCase().trim();
  return hospList.filter(hosp =>
    hosp.keySpecialties.some(s => s.toLowerCase().includes(targetSpecialty))
  );
};

/**
 * Search doctors by text query (name, specialty, qualification, hospital)
 * with an optional specialty filter.
 */
export const searchDoctors = (
  query: string,
  specialty: string = 'All',
  customDoctors?: Doctor[]
): Doctor[] => {
  const docList = customDoctors || doctors;
  const term = query.toLowerCase().trim();

  return docList.filter(doc => {
    const matchesSearch =
      !term ||
      doc.name.toLowerCase().includes(term) ||
      doc.specialty.toLowerCase().includes(term) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(term)) ||
      doc.hospital.toLowerCase().includes(term);

    const matchesSpecialty =
      specialty === 'All' ||
      doc.specialty.toLowerCase().includes(specialty.toLowerCase().trim());

    return matchesSearch && matchesSpecialty;
  });
};

/**
 * Search hospitals by text query (name, location, key specialties)
 * with optional specialty and emergency filters.
 */
export const searchHospitals = (
  query: string,
  specialty: string = 'All',
  emergencyOnly: boolean = false,
  customHospitals?: Hospital[]
): Hospital[] => {
  const hospList = customHospitals || hospitals;
  const term = query.toLowerCase().trim();

  return hospList.filter(hosp => {
    const matchesSearch =
      !term ||
      hosp.name.toLowerCase().includes(term) ||
      hosp.location.toLowerCase().includes(term) ||
      hosp.keySpecialties.some(s => s.toLowerCase().includes(term));

    const matchesSpecialty =
      specialty === 'All' ||
      hosp.keySpecialties.some(s =>
        s.toLowerCase().includes(specialty.toLowerCase().trim())
      );

    const matchesEmergency = !emergencyOnly || Boolean(hosp.emergency24x7);

    return matchesSearch && matchesSpecialty && matchesEmergency;
  });
};

/**
 * Get doctors associated with a specific hospital name.
 */
export const getDoctorsByHospital = (
  hospitalName: string,
  customDoctors?: Doctor[]
): Doctor[] => {
  const docList = customDoctors || doctors;
  const targetName = hospitalName.toLowerCase().trim();
  return docList.filter(doc =>
    doc.hospital.toLowerCase().includes(targetName)
  );
};

/**
 * Find hospital by ID or partial name.
 */
export const getHospitalByName = (
  name: string,
  customHospitals?: Hospital[]
): Hospital | undefined => {
  const hospList = customHospitals || hospitals;
  const targetName = name.toLowerCase().trim();
  return hospList.find(
    h => h.name.toLowerCase().includes(targetName) || h.id === name
  );
};

/**
 * Find doctor by ID.
 */
export const getDoctorById = (
  id: string,
  customDoctors?: Doctor[]
): Doctor | undefined => {
  const docList = customDoctors || doctors;
  return docList.find(d => d.id === id);
};

// Default export container
export const HospitalService = {
  hospitals,
  doctors,
  getAllHospitals,
  getAllDoctors,
  getAllSpecialties,
  filterDoctorsBySpecialty,
  filterHospitalsBySpecialty,
  searchDoctors,
  searchHospitals,
  getDoctorsByHospital,
  getHospitalByName,
  getDoctorById
};

export default HospitalService;
