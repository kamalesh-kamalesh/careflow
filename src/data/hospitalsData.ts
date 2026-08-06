import { Hospital, Doctor } from '../types';

export const SUPPORTED_DISTRICTS = [
  'Erode',
  'Coimbatore',
  'Salem',
  'Tirupur',
  'Chennai',
  'Madurai',
  'Tiruchirappalli',
  'Namakkal',
  'Karur',
  'Nilgiris'
] as const;

export type SupportedDistrict = typeof SUPPORTED_DISTRICTS[number];

export const ERODE_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'Senthil Multi Speciality Hospital', keySpecialties: ['Neurology', 'Neurosurgery', 'Urology', 'Surgical Oncology', 'Stroke Care'], location: 'Perundurai Road, Erode Collectorate', district: 'Erode', emergency24x7: true, rating: 4.8 },
  { id: 'h2', name: 'Care 24 Medical Centre & Hospital', keySpecialties: ['Neurosurgery', 'Cardiology', 'Orthopedics', 'Psychiatry', 'Emergency'], location: 'Perundurai Road, Thindal', district: 'Erode', emergency24x7: true, rating: 4.9 },
  { id: 'h3', name: 'Sudha Institute of Medical Sciences', keySpecialties: ['Infertility & IVF', 'Cardiology', 'Gynecology & Obstetrics', 'Critical Care'], location: 'Perundurai Road / Edayankattuvalasu', district: 'Erode', emergency24x7: true, rating: 4.85 },
  { id: 'h4', name: 'Medway Hospitals', keySpecialties: ['Emergency & Trauma', 'IVF', 'Neurosurgery', 'Orthopedics', 'Pediatrics'], location: 'Nasiyanur Main Road', district: 'Erode', emergency24x7: true, rating: 4.7 },
  { id: 'h5', name: 'Lotus Hospital & Research Centre', keySpecialties: ['Pediatrics', 'Obstetrics & Gynecology', 'Psychiatry', 'Clinical Research'], location: 'Poondurai Main Road, Kollampalayam', district: 'Erode', emergency24x7: true, rating: 4.8 },
  { id: 'h6', name: 'SSS Super Speciality Hospital', keySpecialties: ['Gastroenterology', 'Emergency Medicine', '24/7 Critical Care'], location: 'URC Nagar, Thindal', district: 'Erode', emergency24x7: true, rating: 4.75 },
  { id: 'h7', name: 'Gem Hospital', keySpecialties: ['Gastroenterology', 'Advanced Laparoscopic & GI Surgery'], location: 'Muthukarupannan Street, Surampatti', district: 'Erode', emergency24x7: false, rating: 4.9 },
  { id: 'h8', name: 'Abirami Kidney Care (Dr. Thangavel)', keySpecialties: ['Nephrology', 'Urology', 'Renal Transplants & Dialysis Unit'], location: 'Perundurai Road, Erode Collectorate', district: 'Erode', emergency24x7: true, rating: 4.85 },
  { id: 'h9', name: 'Kalyani Kidney Care Centre', keySpecialties: ['Nephrology', 'Laser Kidney Stone Procedures', 'Dialysis'], location: 'Mettur Road / Edayankattuvalasu', district: 'Erode', emergency24x7: false, rating: 4.6 },
  { id: 'h10', name: 'Government Thanthai Periyar Hospital (Erode GH)', keySpecialties: ['General Medicine', 'General Surgery', 'Emergency', 'Maternity & Trauma'], location: 'EVN Road, Surampatti', district: 'Erode', emergency24x7: true, rating: 4.5 },
  { id: 'h11', name: 'C.K. Hospital', keySpecialties: ['Multispeciality', 'Orthopedics', 'General & Laparoscopic Surgery'], location: 'Surampattivalasu / Marapalam', district: 'Erode', emergency24x7: true, rating: 4.6 },
  { id: 'h12', name: 'KMCH Specialist Hospital (Erode Branch)', keySpecialties: ['Cardiology', 'Emergency Care', 'Internal Medicine', 'Critical Care'], location: 'Palaniappa Street, Opp. Govt Hospital', district: 'Erode', emergency24x7: true, rating: 4.9 },
  { id: 'h13', name: 'Be Well Hospitals', keySpecialties: ['General Medicine', 'Nephrology', 'Diabetology', 'Women\'s Health'], location: 'Gandhiji Road, Erode Fort', district: 'Erode', emergency24x7: true, rating: 4.7 },
  { id: 'h14', name: 'Arasan Eye Hospital', keySpecialties: ['Ophthalmology', 'Cataract & Refractive Surgeries', 'Laser Eye Surgery'], location: 'Royal Theatre Road, Erode Collectorate', district: 'Erode', emergency24x7: false, rating: 4.8 },
  { id: 'h15', name: 'Erode Medical Centre', keySpecialties: ['Emergency Medicine', 'General Surgery', 'Critical Care & Trauma'], location: 'Perundurai Road, Kumalankuttai', district: 'Erode', emergency24x7: true, rating: 4.65 },
  { id: 'h16', name: 'Genesis IVF Advanced Fertility Clinic', keySpecialties: ['Fertility Treatments', 'IVF', 'IUI', 'Gynecology & Obstetrics'], location: 'Perundurai Road, Veerappampalayam', district: 'Erode', emergency24x7: false, rating: 4.9 },
  { id: 'h17', name: 'City Hospital', keySpecialties: ['General Surgery', 'Pediatric Surgery', 'Radiology & Diagnostics'], location: 'RKV Road, Karungalpalayam', district: 'Erode', emergency24x7: true, rating: 4.55 },
  { id: 'h18', name: 'K.G. Nursing Home', keySpecialties: ['Gynecology & Obstetrics', 'Urology', 'General Care'], location: 'Mettur Road, Erode', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h19', name: 'Thangam Hospital', keySpecialties: ['Pediatrics', 'Child Care & Neonatology (NICU)'], location: 'East Arch Road, Periyar Nagar', district: 'Erode', emergency24x7: true, rating: 4.75 },
  { id: 'h20', name: 'Ortho Life Hospital', keySpecialties: ['Orthopedics', 'Joint Replacement', 'Trauma Care', 'Arthroscopy'], location: 'EVN Road, Surampatti / NGGO Colony', district: 'Erode', emergency24x7: true, rating: 4.7 },
  { id: 'h21', name: 'Erode Trust Hospital', keySpecialties: ['Neurology', 'Internal Medicine', 'Intensive Care Unit'], location: 'Perundurai Road, Govindaraj Nagar', district: 'Erode', emergency24x7: true, rating: 4.6 },
  { id: 'h22', name: 'Maaruthi Medical Centre & Hospital (MMCH)', keySpecialties: ['Multispeciality', 'Critical Care', 'Emergency & Trauma'], location: 'Perundurai Road, Erode', district: 'Erode', emergency24x7: true, rating: 4.8 },
  { id: 'h23', name: 'Acchutha Eye Care', keySpecialties: ['Ophthalmology', 'Cornea', 'Cataract Care', 'Glaucoma Services'], location: 'Periyar Nagar, Erode', district: 'Erode', emergency24x7: false, rating: 4.75 },
  { id: 'h24', name: 'Fresh Life Hospital', keySpecialties: ['Fetal Medicine', 'Maternity Care', 'Advanced Ultrasound Scans'], location: 'Muthu Karuppannan St, Edayankattuvalasu', district: 'Erode', emergency24x7: false, rating: 4.7 },
  { id: 'h25', name: 'Vasan Eye Care Hospital', keySpecialties: ['Ophthalmology', 'Laser Vision Correction', 'Retina Services'], location: 'Perundurai Road, Erode', district: 'Erode', emergency24x7: false, rating: 4.65 },
  { id: 'h26', name: 'Surya Hospital', keySpecialties: ['Pediatrics', 'Dermatology', 'General Medical Care'], location: 'Brough Road, Chidambaram Colony', district: 'Erode', emergency24x7: false, rating: 4.6 },
  { id: 'h27', name: 'Aditi Hospital', keySpecialties: ['General Medicine', 'Pediatrics', 'Emergency Care'], location: 'EVN Road, Erode City', district: 'Erode', emergency24x7: true, rating: 4.5 },
  { id: 'h28', name: 'National Hospital', keySpecialties: ['General Surgery', 'Internal Medicine', 'Emergency Care'], location: 'EVN Road, Surampatti', district: 'Erode', emergency24x7: true, rating: 4.55 },
  { id: 'h29', name: 'Guhan ENT Hospital', keySpecialties: ['Ear, Nose, Throat (ENT)', 'Head-Neck Surgery'], location: 'Brough Road, Erode HO', district: 'Erode', emergency24x7: false, rating: 4.8 },
  { id: 'h30', name: 'Dr. K. M. Nallaswamy Hospital', keySpecialties: ['Multispeciality', 'Orthopedics', 'General & Trauma Surgery'], location: 'Power House Road, Govindaraj Nagar', district: 'Erode', emergency24x7: true, rating: 4.7 },
  { id: 'h31', name: 'The Eye Foundation', keySpecialties: ['Advanced Ophthalmology', 'Laser Cataract & LASIK Surgery'], location: 'Palayapalayam, Perundurai Road', district: 'Erode', emergency24x7: false, rating: 4.9 },
  { id: 'h32', name: 'Sri Hari Medical Center', keySpecialties: ['ENT Speciality', 'Endoscopic Sinus Surgery', 'Head & Neck Care'], location: 'Muthu Karuppan Street, Erode', district: 'Erode', emergency24x7: false, rating: 4.65 },
  { id: 'h33', name: 'KCS Multi Speciality Hospital', keySpecialties: ['General Surgery', 'Internal Medicine', 'Pediatric Care'], location: 'GH to Surampatti Road, Chidambaram Colony', district: 'Erode', emergency24x7: true, rating: 4.55 },
  { id: 'h34', name: 'Shri Preethi Hospital', keySpecialties: ['Obstetrics & Gynecology', 'Neurology', 'General Medicine'], location: '1st Street, Surampatti', district: 'Erode', emergency24x7: false, rating: 4.6 },
  { id: 'h35', name: 'Preethi Neuro Hospital', keySpecialties: ['Neurology', 'Stroke Unit', 'Neurosurgery & Brain Care'], location: 'Opp. Surya Mess, NGGO Colony', district: 'Erode', emergency24x7: true, rating: 4.85 },
  { id: 'h36', name: 'Bharathi Heart & Maternity Hospital', keySpecialties: ['Cardiology', 'Obstetrics', 'Gynecology & Maternity Care'], location: 'Surampatti Naal Road, Surampatti', district: 'Erode', emergency24x7: true, rating: 4.7 },
  { id: 'h37', name: 'Rhythm Medical Centre and Hospital', keySpecialties: ['Multispeciality', 'General Surgery', 'Critical Care Unit'], location: 'Karur Bye Pass Road, Kollampalayam', district: 'Erode', emergency24x7: true, rating: 4.6 },
  { id: 'h38', name: 'Kokila Sekar Nursing Home', keySpecialties: ['Obstetrics & Gynecology', 'Maternity & Women Health Care'], location: 'Marapalam, Erode', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h39', name: 'Sri Vijaya Hitech Hospital', keySpecialties: ['Multispeciality', 'General Surgery', 'Trauma & Orthopedics'], location: 'Chidambaram Colony, Erode', district: 'Erode', emergency24x7: true, rating: 4.65 },
  { id: '40', name: 'Limbus Medical Centre', keySpecialties: ['Multispeciality', 'Diabetology', 'Internal Medicine'], location: 'Periyar Nagar, Erode', district: 'Erode', emergency24x7: false, rating: 4.55 },
  { id: 'h41', name: 'L.K.M. Hospital', keySpecialties: ['Orthopedics', 'General Surgery', 'Emergency Care'], location: 'Brough Road / Surampatti', district: 'Erode', emergency24x7: true, rating: 4.5 },
  { id: 'h42', name: 'Naveen Balaji Maternity Nursing Home', keySpecialties: ['Maternity Care', 'Obstetrics', 'Women\'s Health'], location: 'Near NGO Colony, Periyar Salai', district: 'Erode', emergency24x7: false, rating: 4.6 },
  { id: 'h43', name: 'KGR Nursing Home', keySpecialties: ['General Medicine', 'Obstetrics', 'Women & Child Health'], location: '80 Feet Road, Erode', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h44', name: 'Nassir Nursing Home', keySpecialties: ['General Surgery', 'Internal Medicine', 'Pediatric Care'], location: 'Near Head Post Office, Marapalam', district: 'Erode', emergency24x7: false, rating: 4.55 },
  { id: 'h45', name: 'Arcees Maternity Hospital', keySpecialties: ['Obstetrics', 'Gynecology & Maternity Services'], location: 'Perundurai Road, Erode Fort', district: 'Erode', emergency24x7: false, rating: 4.6 },
  { id: 'h46', name: 'Kumudha Hospital', keySpecialties: ['General Surgery', 'Internal Medicine', 'Pediatric Health'], location: 'RKV Road, Karungalpalayam', district: 'Erode', emergency24x7: true, rating: 4.5 },
  { id: 'h47', name: 'KRN Hospital', keySpecialties: ['General Medicine', 'Emergency Care', 'Orthopedics'], location: 'EVN Road, Kandasamy Street', district: 'Erode', emergency24x7: true, rating: 4.6 },
  { id: 'h48', name: 'Balaji Nursing Home', keySpecialties: ['General Medicine', 'Maternity Care', 'Emergency Services'], location: 'Near Bus Stand, Sathy Road', district: 'Erode', emergency24x7: true, rating: 4.5 },
  { id: 'h49', name: 'Rajan Dhanalakshmi Nursing Home', keySpecialties: ['Obstetrics', 'Gynecology', 'General Medicine'], location: 'Gandhiji Nagar, Erode Fort', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h50', name: 'Erode Ortho Center', keySpecialties: ['Joint Replacement', 'Fracture Care & Orthopedics'], location: 'Perundurai Road, Erode', district: 'Erode', emergency24x7: true, rating: 4.8 },
  { id: 'h51', name: 'Duraisamy Hospital', keySpecialties: ['General Surgery', 'Internal Medicine', 'Emergency Care'], location: 'Sathy Road, Erode', district: 'Erode', emergency24x7: true, rating: 4.5 },
  { id: 'h52', name: 'J.B. Clinic and Hospital', keySpecialties: ['Diabetology', 'General Medicine', 'Family Health Care'], location: 'EVN Road, Erode', district: 'Erode', emergency24x7: false, rating: 4.6 },
  { id: 'h53', name: 'Kumarasamy Hospital', keySpecialties: ['Orthopedics', 'General Medicine', 'Rehabilitation'], location: 'Perundurai Road, Erode', district: 'Erode', emergency24x7: true, rating: 4.65 },
  { id: 'h54', name: 'Om Sakthi Hospital', keySpecialties: ['General Surgery', 'Maternity', 'Pediatric Care'], location: 'Chettipalayam, Erode', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h55', name: 'Baby Hospital', keySpecialties: ['Pediatrics', 'Child Health', 'Neonatology'], location: 'Marapalam, Erode', district: 'Erode', emergency24x7: true, rating: 4.7 },
  { id: 'h56', name: 'Nithya Specialty Clinic', keySpecialties: ['General Practice', 'Diabetology', 'Skin & Dermatology'], location: 'Sampath Nagar, Erode', district: 'Erode', emergency24x7: false, rating: 4.6 },
  { id: 'h57', name: 'Abishek Medical Center', keySpecialties: ['Emergency Medicine', 'Internal Medicine', '24/7 Care'], location: 'Bharathi Street, Erode HO', district: 'Erode', emergency24x7: true, rating: 4.55 },
  { id: 'h58', name: 'Sisu Hospital India Ltd', keySpecialties: ['Pediatric Care', 'Neonatology', 'General Medicine'], location: 'Sami Building, Erode Fort', district: 'Erode', emergency24x7: true, rating: 4.65 },
  { id: 'h59', name: 'Rathnam Maternity Clinic (Dr. Nancy)', keySpecialties: ['Maternity', 'Gynecology', 'Fetal Health Care'], location: 'Kovalan Street, Erode Collectorate', district: 'Erode', emergency24x7: false, rating: 4.7 },
  { id: 'h60', name: 'S R Hospital', keySpecialties: ['Pediatrics', 'Child Care', 'General Surgery'], location: 'Posarithotam, EPB Nagar', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h61', name: 'Arockia Medical Centre & Hospital', keySpecialties: ['Multispeciality', 'Emergency Care', 'Family Medicine'], location: 'Kavindapadi, Erode District', district: 'Erode', emergency24x7: true, rating: 4.55 },
  { id: 'h62', name: 'Dharani Multi Speciality Hospital', keySpecialties: ['Multispeciality', 'Trauma Care', 'Orthopedics', 'Surgery'], location: 'Perundurai Road, Chennimalai', district: 'Erode', emergency24x7: true, rating: 4.65 },
  { id: 'h63', name: 'Sri Achuthaaa Nursing Home', keySpecialties: ['General Medicine', 'Maternity Care', 'Women\'s Health'], location: 'Bhavani Road, Kavindapadi', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h64', name: 'P K Hospital', keySpecialties: ['Multispeciality', 'Emergency Medicine', 'General Care'], location: 'Krishnapuram, Sathy Road', district: 'Erode', emergency24x7: true, rating: 4.55 },
  { id: 'h65', name: 'Vijay Nursing Home', keySpecialties: ['Obstetrics & Gynecology', 'General Medicine'], location: 'Sathy Main Road, Kavindapadi', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h66', name: 'Mahalingam Nursing Home', keySpecialties: ['Emergency Care', 'General Surgery', 'Internal Medicine'], location: 'Sakthi Main Road, Anthiyur', district: 'Erode', emergency24x7: true, rating: 4.5 },
  { id: 'h67', name: 'A.D. PGK Hospital', keySpecialties: ['Multispeciality', 'General Surgery', 'Pediatrics'], location: 'Ward 2, Anthiyur', district: 'Erode', emergency24x7: false, rating: 4.5 },
  { id: 'h68', name: 'HRS Medical Centre', keySpecialties: ['General Medicine', 'Emergency Care', 'Orthopedics'], location: 'Tirupur Main Road, Uttukuli', district: 'Erode', emergency24x7: true, rating: 4.6 },
  { id: 'h69', name: 'Government Hospital Bhavani', keySpecialties: ['General Medicine', 'Surgery', 'Maternity & Emergency Care'], location: 'Bhavani Main Road, Erode District', district: 'Erode', emergency24x7: true, rating: 4.4 },
  { id: 'h70', name: 'Government Hospital Gobichettipalayam', keySpecialties: ['General Care', 'Pediatrics', 'Surgery & Trauma Care'], location: 'Gobichettipalayam, Erode District', district: 'Erode', emergency24x7: true, rating: 4.45 }
];

export const OTHER_DISTRICT_HOSPITALS: Hospital[] = [
  // Coimbatore
  { id: 'cbe1', name: 'Kovai Medical Center and Hospital (KMCH)', keySpecialties: ['Cardiology', 'Neurology', 'Oncology', 'Organ Transplants', 'Emergency'], location: 'Avinashi Road, Civil Aerodrome Post, Coimbatore', district: 'Coimbatore', emergency24x7: true, rating: 4.9 },
  { id: 'cbe2', name: 'PSG Hospitals', keySpecialties: ['Multispeciality', 'Gastroenterology', 'Pediatrics', 'Pulmonology', 'Critical Care'], location: 'Peelamedu, Coimbatore', district: 'Coimbatore', emergency24x7: true, rating: 4.85 },
  { id: 'cbe3', name: 'Ganga Hospital', keySpecialties: ['Orthopedics', 'Spine Surgery', 'Trauma', 'Plastic & Reconstructive Surgery'], location: '313, Mettupalayam Road, Coimbatore', district: 'Coimbatore', emergency24x7: true, rating: 4.95 },
  { id: 'cbe4', name: 'Sri Ramakrishna Hospital', keySpecialties: ['Oncology', 'Cardiology', 'Nephrology', 'General Surgery'], location: 'Siddhapudur, Coimbatore', district: 'Coimbatore', emergency24x7: true, rating: 4.8 },

  // Salem
  { id: 'slm1', name: 'Manipal Hospital Salem', keySpecialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology'], location: 'Dalmia Board, Bangalore Highway, Salem', district: 'Salem', emergency24x7: true, rating: 4.8 },
  { id: 'slm2', name: 'Gokulam Hospital', keySpecialties: ['Neurosurgery', 'Critical Care', 'Obstetrics & Gynecology', 'Emergency'], location: '3/60, Meyyanur Road, Salem', district: 'Salem', emergency24x7: true, rating: 4.75 },
  { id: 'slm3', name: 'Shanmuga Hospital', keySpecialties: ['Gynecology & IVF', 'Pediatrics', 'Internal Medicine'], location: 'Sarada College Road, Salem', district: 'Salem', emergency24x7: true, rating: 4.7 },

  // Tirupur
  { id: 'tpr1', name: 'Revathi Medical Center', keySpecialties: ['Internal Medicine', 'Cardiology', 'General Surgery', 'Dialysis'], location: '10, Valipalayam Main Road / Kangayam Road, Tirupur', district: 'Tirupur', emergency24x7: true, rating: 4.75 },
  { id: 'tpr2', name: 'Government Head Quarters Hospital Tirupur', keySpecialties: ['General Medicine', 'Surgery', 'Maternity', 'Emergency'], location: 'KSC School Road, Tirupur', district: 'Tirupur', emergency24x7: true, rating: 4.5 },

  // Chennai
  { id: 'chn1', name: 'Apollo Hospitals Greams Road', keySpecialties: ['Cardiology', 'Neurology', 'Organ Transplant', 'Oncology', 'Robotic Surgery'], location: '21 Greams Lane, Thousand Lights, Chennai', district: 'Chennai', emergency24x7: true, rating: 4.95 },
  { id: 'chn2', name: 'MIOT International', keySpecialties: ['Orthopedics', 'Joint Replacement', 'Nephrology', 'Trauma'], location: '4/112, Mount Poonamallee Rd, Manapakkam, Chennai', district: 'Chennai', emergency24x7: true, rating: 4.9 },
  { id: 'chn3', name: 'Fortis Malar Hospital', keySpecialties: ['Heart Transplants', 'Cardiology', 'Pediatric Care', 'Gastroenterology'], location: '52, 1st Main Rd, Gandhi Nagar, Adyar, Chennai', district: 'Chennai', emergency24x7: true, rating: 4.85 },

  // Madurai
  { id: 'mdu1', name: 'Apollo Speciality Hospital Madurai', keySpecialties: ['Cardiology', 'Neurosurgery', 'Critical Care', 'Orthopedics'], location: 'Lake View Road, K.K. Nagar, Madurai', district: 'Madurai', emergency24x7: true, rating: 4.85 },
  { id: 'mdu2', name: 'Velammal Medical College & Hospital', keySpecialties: ['Multispeciality', 'Pulmonology', 'Pediatrics', 'General Surgery'], location: 'Velammal Village, Anuppanadi, Madurai', district: 'Madurai', emergency24x7: true, rating: 4.8 },

  // Tiruchirappalli (Trichy)
  { id: 'try1', name: 'Kauvery Hospital Trichy', keySpecialties: ['Cardiology', 'Nephrology', 'Gastroenterology', 'Critical Care'], location: 'No. 1, KC Road, Cantonment, Tiruchirappalli', district: 'Tiruchirappalli', emergency24x7: true, rating: 4.85 },
  { id: 'try2', name: 'Frontline Hospital', keySpecialties: ['Obstetrics & Gynecology', 'Pediatrics', 'Internal Medicine'], location: 'Thillai Nagar, Tiruchirappalli', district: 'Tiruchirappalli', emergency24x7: true, rating: 4.7 },

  // Namakkal
  { id: 'nmk1', name: 'Thangam Health Centre', keySpecialties: ['General Medicine', 'Diabetology', 'Cardiology', 'Surgery'], location: '54, Salem Road, Namakkal', district: 'Namakkal', emergency24x7: true, rating: 4.65 },

  // Karur
  { id: 'krr1', name: 'Apollo Reach Hospital Karur', keySpecialties: ['General Surgery', 'Orthopedics', 'Emergency & Critical Care'], location: 'Kovai Road, Karur', district: 'Karur', emergency24x7: true, rating: 4.7 },

  // Nilgiris
  { id: 'nlg1', name: 'Government Head Quarters Hospital Ooty', keySpecialties: ['General Medicine', 'Pediatrics', 'Emergency & Trauma'], location: 'Hospital Hill Road, Udhagamandalam, Nilgiris', district: 'Nilgiris', emergency24x7: true, rating: 4.5 }
];

export const ALL_HOSPITALS: Hospital[] = [...ERODE_HOSPITALS, ...OTHER_DISTRICT_HOSPITALS];

export const ERODE_DOCTORS: Doctor[] = [
  // Cardiology & Internal Medicine
  { id: 'doc1', name: 'Dr. N. Rajasekar', specialty: 'Cardiology & Internal Medicine', qualification: 'Interventional Cardiologist (MD, DNB)', hospital: 'Sudha & Care 24 Hospitals', district: 'Erode', availability: '10:00 AM - 04:00 PM', experience: '16 Years', rating: 4.9, patientsCount: 220, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc2', name: 'Dr. N. Padmanaban', specialty: 'Cardiology & Internal Medicine', qualification: 'Interventional Cardiologist (MD, DM)', hospital: 'SSS & Care 24 Hospitals', district: 'Erode', availability: '09:30 AM - 03:30 PM', experience: '18 Years', rating: 4.85, patientsCount: 195, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc3', name: 'Dr. R. Anandha Kumar', specialty: 'Cardiology & Internal Medicine', qualification: 'Interventional Cardiologist (DrNB)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '10:00 AM - 05:00 PM', experience: '14 Years', rating: 4.8, patientsCount: 160, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },
  { id: 'doc4', name: 'Dr. M. Jagadeesh', specialty: 'Cardiology & Internal Medicine', qualification: 'Cardiologist (MD, DNB)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '10:30 AM - 04:00 PM', experience: '12 Years', rating: 4.75, patientsCount: 140, patients: [], currentQueueCount: 1, avgConsultationTimeMins: 15 },
  { id: 'doc5', name: 'Dr. P. Vijay', specialty: 'Cardiology & Internal Medicine', qualification: 'Interventional Cardiologist (DNB)', hospital: 'Care 24 Hospital', district: 'Erode', availability: '09:00 AM - 04:00 PM', experience: '15 Years', rating: 4.85, patientsCount: 180, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc6', name: 'Dr. R. Subramanian', specialty: 'Cardiology & Internal Medicine', qualification: 'Senior Cardiologist', hospital: 'Bharathi Heart Hospital', district: 'Erode', availability: '10:30 AM - 04:00 PM', experience: '22 Years', rating: 4.95, patientsCount: 310, patients: [], currentQueueCount: 5, avgConsultationTimeMins: 20 },

  // Cardiothoracic Surgery
  { id: 'doc7', name: 'Dr. S. Balamurugan', specialty: 'Cardiothoracic Surgery', qualification: 'Cardiothoracic Surgeon (MD)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: 'By Appointment', experience: '17 Years', rating: 4.9, patientsCount: 120, patients: [], currentQueueCount: 1, avgConsultationTimeMins: 25 },
  { id: 'doc8', name: 'Dr. Minnathulla', specialty: 'Cardiothoracic Surgery', qualification: 'Cardiothoracic Surgeon (M.Ch)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: 'By Appointment', experience: '15 Years', rating: 4.85, patientsCount: 110, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 25 },

  // Neurology & Neurosurgery
  { id: 'doc9', name: 'Dr. C. Senthilvel', specialty: 'Neurology & Neurosurgery', qualification: 'Senior Neurologist (MD, DM)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '11:00 AM - 03:00 PM', experience: '20 Years', rating: 4.95, patientsCount: 280, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 20 },
  { id: 'doc10', name: 'Dr. Meenakshi G. Shankar', specialty: 'Neurology & Neurosurgery', qualification: 'Neurologist & Neurosonologist (DM)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '09:00 AM - 04:00 PM', experience: '14 Years', rating: 4.88, patientsCount: 175, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc11', name: 'Dr. P. S. Harinivas', specialty: 'Neurology & Neurosurgery', qualification: 'Brain & Spine Surgeon (DNB)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '10:00 AM - 05:00 PM', experience: '13 Years', rating: 4.82, patientsCount: 150, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 20 },
  { id: 'doc12', name: 'Dr. S. Mohan', specialty: 'Neurology & Neurosurgery', qualification: 'Brain & Spine Surgeon (M.Ch)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '10:30 AM - 04:00 PM', experience: '16 Years', rating: 4.87, patientsCount: 190, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 20 },
  { id: 'doc13', name: 'Dr. G. Vikram Raj', specialty: 'Neurology & Neurosurgery', qualification: 'Consultant Neurologist', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '09:30 AM - 02:00 PM', experience: '11 Years', rating: 4.78, patientsCount: 130, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc14', name: 'Dr. C. Sampathkumar', specialty: 'Neurology & Neurosurgery', qualification: 'Consultant Neurologist (DM)', hospital: 'Care 24 Medical Centre', district: 'Erode', availability: '09:00 AM - 01:00 PM', experience: '15 Years', rating: 4.85, patientsCount: 165, patients: [], currentQueueCount: 1, avgConsultationTimeMins: 15 },
  { id: 'doc15', name: 'Dr. S. P. Goutham', specialty: 'Neurology & Neurosurgery', qualification: 'Interventional Neurologist (M.Ch)', hospital: 'Care 24 Medical Centre', district: 'Erode', availability: '10:00 AM - 03:00 PM', experience: '12 Years', rating: 4.83, patientsCount: 145, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 20 },
  { id: 'doc16', name: 'Dr. P. Viggnesh', specialty: 'Neurology & Neurosurgery', qualification: 'Neuro Surgeon (M.Ch)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '10:00 AM - 02:00 PM', experience: '11 Years', rating: 4.81, patientsCount: 135, patients: [], currentQueueCount: 1, avgConsultationTimeMins: 20 },
  { id: 'doc17', name: 'Dr. Preethi', specialty: 'Neurology & Stroke Care', qualification: 'Neurologist (Stroke Care)', hospital: 'Preethi Neuro Hospital', district: 'Erode', availability: '10:00 AM - 02:00 PM', experience: '13 Years', rating: 4.9, patientsCount: 160, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 20 },

  // Nephrology & Urology
  { id: 'doc18', name: 'Dr. T. Saravanan', specialty: 'Nephrology & Urology', qualification: 'Nephrologist & Transplant Physician', hospital: 'Abirami Kidney Care', district: 'Erode', availability: '10:00 AM - 06:00 PM', experience: '19 Years', rating: 4.92, patientsCount: 240, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },
  { id: 'doc19', name: 'Dr. M. Gopinath', specialty: 'Nephrology & Urology', qualification: 'Urologist & Andrologist (M.Ch)', hospital: 'Abirami / Sudha Hospital', district: 'Erode', availability: '09:30 AM - 05:30 PM', experience: '16 Years', rating: 4.86, patientsCount: 210, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc20', name: 'Dr. P. S. Gowri Shankar', specialty: 'Nephrology & Urology', qualification: 'Consultant Urologist (M.Ch)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '10:00 AM - 04:00 PM', experience: '14 Years', rating: 4.8, patientsCount: 155, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc21', name: 'Dr. V. Nagendran', specialty: 'Nephrology & Urology', qualification: 'Consultant Nephrologist (DM)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '10:00 AM - 03:00 PM', experience: '15 Years', rating: 4.84, patientsCount: 170, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc22', name: 'Dr. Vinoj', specialty: 'Nephrology & Urology', qualification: 'Nephrologist & Transplant (DM)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '10:30 AM - 04:00 PM', experience: '12 Years', rating: 4.82, patientsCount: 140, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc23', name: 'Dr. K. Yuvaraja', specialty: 'Nephrology & Urology', qualification: 'Consultant Nephrologist', hospital: 'SSS Super Speciality', district: 'Erode', availability: '11:00 AM - 03:00 PM', experience: '13 Years', rating: 4.79, patientsCount: 130, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc24', name: 'Dr. Shakthi Kumar', specialty: 'Nephrology & Urology', qualification: 'Nephrology Specialist (DNB)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '10:00 AM - 01:00 PM', experience: '10 Years', rating: 4.77, patientsCount: 115, patients: [], currentQueueCount: 1, avgConsultationTimeMins: 15 },

  // Obstetrics, Gynecology & IVF
  { id: 'doc25', name: 'Dr. S. Dhanabagyam', specialty: 'Obstetrics, Gynecology & IVF', qualification: 'Senior ART & IVF Specialist (MD)', hospital: 'Sudha Hospitals', district: 'Erode', availability: '09:00 AM - 02:00 PM', experience: '25 Years', rating: 4.98, patientsCount: 450, patients: [], currentQueueCount: 6, avgConsultationTimeMins: 15 },
  { id: 'doc26', name: 'Dr. S. Pradeepa', specialty: 'Obstetrics, Gynecology & IVF', qualification: 'Senior ART Specialist (DNB, DGO)', hospital: 'Sudha Hospitals', district: 'Erode', availability: '10:00 AM - 04:00 PM', experience: '18 Years', rating: 4.9, patientsCount: 280, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },
  { id: 'doc27', name: 'Dr. K. Gokula Priya', specialty: 'Obstetrics & Gynecology', qualification: 'Obstetrician & Gynecologist (MRCOG)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '10:30 AM - 05:00 PM', experience: '12 Years', rating: 4.82, patientsCount: 160, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc28', name: 'Dr. Jayanthi', specialty: 'Obstetrics & Gynecology', qualification: 'Obstetrician & Gynecologist (DNB)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '09:30 AM - 02:00 PM', experience: '14 Years', rating: 4.84, patientsCount: 175, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc29', name: 'Dr. Shruthi Rajendran', specialty: 'Obstetrics, Gynecology & IVF', qualification: 'IVF Care Specialist (FRM)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '10:00 AM - 04:00 PM', experience: '11 Years', rating: 4.81, patientsCount: 140, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },

  // Pediatrics & Neonatology
  { id: 'doc30', name: 'Dr. S. Rangesh', specialty: 'Pediatrics & Neonatology', qualification: 'Pediatrics & Neonatology (MD)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '10:00 AM - 01:00 PM', experience: '14 Years', rating: 4.88, patientsCount: 200, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc31', name: 'Dr. N. Gowrishankar', specialty: 'Pediatrics & Neonatology', qualification: 'Pediatrics & Neonatology (DNB)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '09:00 AM - 01:00 PM', experience: '16 Years', rating: 4.85, patientsCount: 220, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc32', name: 'Dr. N. Saravanan', specialty: 'Pediatrics & Neonatology', qualification: 'Neonatologist (DM)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '10:00 AM - 02:00 PM', experience: '13 Years', rating: 4.83, patientsCount: 165, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc33', name: 'Dr. P. Jayapal', specialty: 'Pediatrics & Neonatology', qualification: 'Pediatrician (DCH)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '10:30 AM - 05:00 PM', experience: '15 Years', rating: 4.84, patientsCount: 190, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },

  // Gastroenterology & General Surgery
  { id: 'doc34', name: 'Dr. G. Sathiyavelavan', specialty: 'Gastroenterology & GI Surgery', qualification: 'Surgical Gastroenterologist (M.Ch)', hospital: 'Care 24 Medical Centre', district: 'Erode', availability: '10:00 AM - 04:00 PM', experience: '17 Years', rating: 4.9, patientsCount: 230, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc35', name: 'Dr. T. A. Balakumaran', specialty: 'Gastroenterology & GI Surgery', qualification: 'Medical Gastroenterologist (DNB)', hospital: 'Care 24 Medical Centre', district: 'Erode', availability: '09:30 AM - 03:00 PM', experience: '13 Years', rating: 4.8, patientsCount: 160, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc36', name: 'Dr. K. L. Sathish Kumar', specialty: 'Gastroenterology & GI Surgery', qualification: 'Laparoscopic GI Surgeon', hospital: 'SSS Super Speciality', district: 'Erode', availability: '09:30 AM - 02:30 PM', experience: '15 Years', rating: 4.85, patientsCount: 185, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc37', name: 'Dr. G. Sathish Kumar', specialty: 'Gastroenterology & GI Surgery', qualification: 'General & Laparoscopic Surgeon', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '10:00 AM - 03:00 PM', experience: '14 Years', rating: 4.82, patientsCount: 165, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc38', name: 'Dr. E. K. Sagadhevan', specialty: 'General & Laparoscopic Surgery', qualification: 'General Surgeon (MS)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '09:00 AM - 01:00 PM', experience: '16 Years', rating: 4.84, patientsCount: 190, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },

  // Pulmonology & Respiratory Care
  { id: 'doc39', name: 'Dr. K. B. Reshma', specialty: 'Pulmonology & Respiratory Care', qualification: 'Pulmonologist & Sleep Specialist', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '10:30 AM - 04:00 PM', experience: '11 Years', rating: 4.8, patientsCount: 140, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc40', name: 'Dr. K. Umashankar', specialty: 'Pulmonology & Respiratory Care', qualification: 'Pulmonologist (Chest Physician)', hospital: 'Care 24 Medical Centre', district: 'Erode', availability: '10:30 AM - 04:30 PM', experience: '16 Years', rating: 4.88, patientsCount: 190, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },

  // Orthopedics & Spine Surgery
  { id: 'doc41', name: 'Dr. K. Attiyanan', specialty: 'Orthopedics & Joint Replacement', qualification: 'Orthopaedics Surgeon (MS)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '10:00 AM - 03:00 PM', experience: '18 Years', rating: 4.89, patientsCount: 260, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },
  { id: 'doc42', name: 'Dr. K. Dinesh', specialty: 'Orthopedics & Spine Surgery', qualification: 'Spine Surgeon (FNB)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '11:00 AM - 04:00 PM', experience: '13 Years', rating: 4.85, patientsCount: 170, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 20 },
  { id: 'doc43', name: 'Dr. Umapathy Sivam', specialty: 'Orthopedics & Joint Replacement', qualification: 'Orthopedist (MD)', hospital: 'Lotus Hospitals', district: 'Erode', availability: '10:00 AM - 02:00 PM', experience: '12 Years', rating: 4.81, patientsCount: 150, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },

  // Oncology
  { id: 'doc44', name: 'Dr. S. Karthikeyan', specialty: 'Oncology', qualification: 'Surgical Oncologist (Cancer)', hospital: 'Care 24 Medical Centre', district: 'Erode', availability: '10:00 AM - 03:00 PM', experience: '15 Years', rating: 4.91, patientsCount: 210, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 20 },
  { id: 'doc45', name: 'Dr. J. Sugashwaran', specialty: 'Oncology', qualification: 'Radiation Oncology', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '10:30 AM - 04:00 PM', experience: '13 Years', rating: 4.86, patientsCount: 175, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 20 },

  // Endocrinology & Diabetes Care
  { id: 'doc46', name: 'Dr. N. Selvaraj', specialty: 'Endocrinology & Diabetes Care', qualification: 'Senior Diabetologist (MD)', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: '09:00 AM - 05:00 PM', experience: '21 Years', rating: 4.95, patientsCount: 340, patients: [], currentQueueCount: 5, avgConsultationTimeMins: 15 },
  { id: 'doc47', name: 'Dr. P. S. Aarthi', specialty: 'Endocrinology & Diabetes Care', qualification: 'General Medicine & Diabetologist', hospital: 'Lotus Hospitals', district: 'Erode', availability: '09:30 AM - 02:30 PM', experience: '10 Years', rating: 4.78, patientsCount: 130, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },

  // Plastic Surgery
  { id: 'doc48', name: 'Dr. K. Gowthaman', specialty: 'Plastic & Cosmetic Surgery', qualification: 'Cosmetic & Plastic Surgeon', hospital: 'Senthil Multi Speciality', district: 'Erode', availability: 'By Appointment', experience: '14 Years', rating: 4.88, patientsCount: 140, patients: [], currentQueueCount: 1, avgConsultationTimeMins: 20 },

  // ENT
  { id: 'doc49', name: 'Dr. M. P. Kavin Kumar', specialty: 'ENT Speciality', qualification: 'Consultant Laryngologist (ENT)', hospital: 'Sudha Multi Speciality', district: 'Erode', availability: '10:00 AM - 02:00 PM', experience: '12 Years', rating: 4.82, patientsCount: 150, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 }
];

export const OTHER_DISTRICT_DOCTORS: Doctor[] = [
  // Coimbatore
  { id: 'doc_cbe1', name: 'Dr. V. S. Rajan', specialty: 'Cardiology & Internal Medicine', qualification: 'Chief Interventional Cardiologist (DM)', hospital: 'Kovai Medical Center and Hospital (KMCH)', district: 'Coimbatore', availability: '09:00 AM - 04:00 PM', experience: '22 Years', rating: 4.95, patientsCount: 380, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc_cbe2', name: 'Dr. S. Rajasekaran', specialty: 'Orthopedics & Spine Surgery', qualification: 'Chairperson & Chief Orthopedic Surgeon', hospital: 'Ganga Hospital', district: 'Coimbatore', availability: '10:00 AM - 03:00 PM', experience: '28 Years', rating: 4.98, patientsCount: 520, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 20 },
  { id: 'doc_cbe3', name: 'Dr. M. Jayanthi', specialty: 'Neurology & Neurosurgery', qualification: 'Senior Neurologist (MD, DM)', hospital: 'PSG Hospitals', district: 'Coimbatore', availability: '10:30 AM - 04:30 PM', experience: '17 Years', rating: 4.88, patientsCount: 210, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },
  { id: 'doc_cbe4', name: 'Dr. P. K. Swaminathan', specialty: 'Gastroenterology & GI Surgery', qualification: 'Surgical Gastroenterologist (M.Ch)', hospital: 'Sri Ramakrishna Hospital', district: 'Coimbatore', availability: '09:30 AM - 03:30 PM', experience: '19 Years', rating: 4.85, patientsCount: 240, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },

  // Salem
  { id: 'doc_slm1', name: 'Dr. K. Shanmugam', specialty: 'Cardiology & Internal Medicine', qualification: 'Senior Cardiologist (MD, DM)', hospital: 'Manipal Hospital Salem', district: 'Salem', availability: '09:30 AM - 04:00 PM', experience: '18 Years', rating: 4.88, patientsCount: 230, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc_slm2', name: 'Dr. R. Prabakar', specialty: 'Neurology & Neurosurgery', qualification: 'Senior Neurosurgeon (M.Ch)', hospital: 'Gokulam Hospital', district: 'Salem', availability: '10:00 AM - 03:00 PM', experience: '16 Years', rating: 4.82, patientsCount: 190, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 20 },
  { id: 'doc_slm3', name: 'Dr. S. Vijayalakshmi', specialty: 'Obstetrics, Gynecology & IVF', qualification: 'Gynecologist & Fertility Specialist', hospital: 'Shanmuga Hospital', district: 'Salem', availability: '10:00 AM - 05:00 PM', experience: '15 Years', rating: 4.86, patientsCount: 200, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },

  // Tirupur
  { id: 'doc_tpr1', name: 'Dr. M. Revathi', specialty: 'Cardiology & Internal Medicine', qualification: 'Senior Physician & Diabetologist', hospital: 'Revathi Medical Center', district: 'Tirupur', availability: '09:00 AM - 05:00 PM', experience: '20 Years', rating: 4.9, patientsCount: 310, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },
  { id: 'doc_tpr2', name: 'Dr. P. Kandasamy', specialty: 'Orthopedics & Joint Replacement', qualification: 'Chief Orthopedic Consultant', hospital: 'Government Head Quarters Hospital Tirupur', district: 'Tirupur', availability: '09:00 AM - 02:00 PM', experience: '17 Years', rating: 4.75, patientsCount: 220, patients: [], currentQueueCount: 5, avgConsultationTimeMins: 15 },

  // Chennai
  { id: 'doc_chn1', name: 'Dr. Y. V. Subba Reddy', specialty: 'Cardiology & Internal Medicine', qualification: 'Senior Interventional Cardiologist', hospital: 'Apollo Hospitals Greams Road', district: 'Chennai', availability: '10:00 AM - 04:00 PM', experience: '25 Years', rating: 4.96, patientsCount: 460, patients: [], currentQueueCount: 5, avgConsultationTimeMins: 20 },
  { id: 'doc_chn2', name: 'Dr. B. Chidambaram', specialty: 'Neurology & Neurosurgery', qualification: 'Chief Neurosurgeon (M.Ch, FRCS)', hospital: 'MIOT International', district: 'Chennai', availability: '11:00 AM - 04:00 PM', experience: '24 Years', rating: 4.94, patientsCount: 390, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 20 },
  { id: 'doc_chn3', name: 'Dr. M. Vijayakumar', specialty: 'Nephrology & Urology', qualification: 'Chief Nephrologist & Transplant Specialist', hospital: 'Fortis Malar Hospital', district: 'Chennai', availability: '09:30 AM - 03:30 PM', experience: '21 Years', rating: 4.91, patientsCount: 340, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },

  // Madurai
  { id: 'doc_mdu1', name: 'Dr. K. Sivaraman', specialty: 'Cardiology & Internal Medicine', qualification: 'Senior Cardiologist (MD, DM)', hospital: 'Apollo Speciality Hospital Madurai', district: 'Madurai', availability: '10:00 AM - 04:00 PM', experience: '19 Years', rating: 4.89, patientsCount: 270, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },
  { id: 'doc_mdu2', name: 'Dr. N. Meenakshi', specialty: 'Pulmonology & Respiratory Care', qualification: 'Pulmonologist & Chest Physician', hospital: 'Velammal Medical College & Hospital', district: 'Madurai', availability: '09:00 AM - 03:00 PM', experience: '15 Years', rating: 4.84, patientsCount: 195, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },

  // Tiruchirappalli (Trichy)
  { id: 'doc_try1', name: 'Dr. S. Manivannan', specialty: 'Cardiology & Internal Medicine', qualification: 'Consultant Physician & Cardiologist', hospital: 'Kauvery Hospital Trichy', district: 'Tiruchirappalli', availability: '10:00 AM - 05:00 PM', experience: '21 Years', rating: 4.92, patientsCount: 330, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },
  { id: 'doc_try2', name: 'Dr. K. Nithya', specialty: 'Obstetrics, Gynecology & IVF', qualification: 'Obstetrician & IVF Care Specialist', hospital: 'Frontline Hospital', district: 'Tiruchirappalli', availability: '10:00 AM - 03:30 PM', experience: '14 Years', rating: 4.85, patientsCount: 180, patients: [], currentQueueCount: 2, avgConsultationTimeMins: 15 },

  // Namakkal
  { id: 'doc_nmk1', name: 'Dr. R. Thangam', specialty: 'Endocrinology & Diabetes Care', qualification: 'Diabetologist & General Physician', hospital: 'Thangam Health Centre', district: 'Namakkal', availability: '09:00 AM - 06:00 PM', experience: '23 Years', rating: 4.88, patientsCount: 350, patients: [], currentQueueCount: 4, avgConsultationTimeMins: 15 },

  // Karur
  { id: 'doc_krr1', name: 'Dr. S. Karunakaran', specialty: 'General & Laparoscopic Surgery', qualification: 'Senior General & Trauma Surgeon', hospital: 'Apollo Reach Hospital Karur', district: 'Karur', availability: '10:00 AM - 04:00 PM', experience: '16 Years', rating: 4.8, patientsCount: 210, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 },

  // Nilgiris
  { id: 'doc_nlg1', name: 'Dr. A. Mary', specialty: 'Pediatrics & Neonatology', qualification: 'Family Physician & Pediatrician', hospital: 'Government Head Quarters Hospital Ooty', district: 'Nilgiris', availability: '09:00 AM - 03:00 PM', experience: '15 Years', rating: 4.78, patientsCount: 180, patients: [], currentQueueCount: 3, avgConsultationTimeMins: 15 }
];

export const ALL_DOCTORS: Doctor[] = [...ERODE_DOCTORS, ...OTHER_DISTRICT_DOCTORS];

