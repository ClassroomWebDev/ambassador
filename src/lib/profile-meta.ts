export const BD_DISTRICTS = [
  "Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria","Chandpur",
  "Chapai Nawabganj","Chattogram","Chuadanga","Cox's Bazar","Cumilla","Dhaka","Dinajpur",
  "Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore",
  "Jhalokati","Jhenaidah","Joypurhat","Khagrachhari","Khulna","Kishoreganj","Kurigram",
  "Kushtia","Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur",
  "Moulvibazar","Munshiganj","Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi",
  "Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali","Pirojpur",
  "Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj",
  "Sunamganj","Sylhet","Tangail","Thakurgaon",
] as const;

export const RELIGIONS = ["Islam", "Hinduism", "Christianity", "Buddhism", "Others"] as const;

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

export const MANDATORY_FIELDS = [
  "full_name",
  "date_of_birth",
  "religion",
  "address",
  "home_district",
  "mobile",
  "facebook_link",
] as const;

export const OPTIONAL_FIELDS = [
  "father_name",
  "mother_name",
  "alt_mobile",
  "whatsapp",
  "blood_group",
  "institution",
  "hobby",
  "favourite_book",
  "favourite_place",
  "ultimate_goal",
  "favourite_movies",
  "favourite_person",
  "idol",
  "favourite_teacher",
  "photo_url",
] as const;

export const FIELD_LABELS = {
  full_name: "Name",
  date_of_birth: "Date of Birth",
  religion: "Religion",
  address: "Address",
  home_district: "Home District",
  mobile: "Mobile Number",
  facebook_link: "Facebook Profile Link",
  father_name: "Fathers Name",
  mother_name: "Mothers Name",
  alt_mobile: "Alternative Mobile",
  whatsapp: "WhatsApp Number",
  blood_group: "Blood Group",
  institution: "Institution",
  hobby: "Hobby",
  favourite_book: "Favourite Book",
  favourite_place: "Favourite Place",
  ultimate_goal: "Ultimate Goal in Life",
  favourite_movies: "Favourite Movies",
  favourite_person: "Favourite Person",
  idol: "Idol",
  favourite_teacher: "Favorite Teacher",
  photo_url: "Photo",
} as const satisfies Record<string, string>;

const filled = (value: unknown) =>
  typeof value === "string" ? value.trim().length > 0 : value != null;

/** Mandatory fields carry 70% of the score, optional fields the remaining 30%. */
export function profileCompletion(values: Record<string, unknown>) {
  const mandatoryDone = MANDATORY_FIELDS.filter((f) => filled(values[f])).length;
  const optionalDone = OPTIONAL_FIELDS.filter((f) => filled(values[f])).length;

  const mandatoryPct = (mandatoryDone / MANDATORY_FIELDS.length) * 70;
  const optionalPct = (optionalDone / OPTIONAL_FIELDS.length) * 30;

  return {
    percent: Math.round(mandatoryPct + optionalPct),
    mandatoryDone,
    mandatoryTotal: MANDATORY_FIELDS.length,
    optionalDone,
    optionalTotal: OPTIONAL_FIELDS.length,
    missingMandatory: MANDATORY_FIELDS.filter((f) => !filled(values[f])),
  };
}
