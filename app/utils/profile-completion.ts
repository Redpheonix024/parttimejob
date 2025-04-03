import { UserProfile } from "@/types/user";

interface ProfileSection {
  name: string;
  weight: number;
  fields: { name: keyof UserProfile | string; weight: number }[];
  validator?: (profile: UserProfile) => {
    completed: boolean;
    score: number;
    completedFields?: string[];
    remainingFields?: string[];
    nextField?: string;
  };
}

const profileSections: ProfileSection[] = [
  {
    name: "Basic Info",
    weight: 100,
    fields: [
      { name: "firstName", weight: 15 },
      { name: "lastName", weight: 15 },
      { name: "email", weight: 15 },
      { name: "phoneVerified", weight: 15 },
      { name: "dateOfBirth", weight: 10 },
      { name: "gender", weight: 10 },
      { name: "currentLocation", weight: 10 },
      { name: "permanentAddress", weight: 10 },
    ],
    validator: (profile) => {
      const fieldScores = {
        firstName: !!profile.firstName ? 15 : 0,
        lastName: !!profile.lastName ? 15 : 0,
        email: !!profile.email ? 15 : 0,
        phoneVerified: profile.phoneVerified ? 15 : 0,
        dateOfBirth: !!profile.dateOfBirth ? 10 : 0,
        gender: !!profile.gender ? 10 : 0,
        currentLocation: profile.currentLocation?.city ? 10 : 0,
        permanentAddress:
          !!profile.permanentAddress?.street &&
          !!profile.permanentAddress?.state &&
          !!profile.permanentAddress?.district &&
          !!profile.permanentAddress?.pincode
            ? 10
            : 0,
      };

      const totalScore = Object.values(fieldScores).reduce(
        (sum, score) => sum + score,
        0
      );
      const completedFields = Object.entries(fieldScores)
        .filter(([_, score]) => score > 0)
        .map(([field]) => field);

      const nextField = Object.entries(fieldScores).find(
        ([_, score]) => score === 0
      )?.[0];

      const fieldLabels: { [key: string]: string } = {
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        phoneVerified: "Phone Verification",
        dateOfBirth: "Date of Birth",
        gender: "Gender",
        currentLocation: "Current Location",
        permanentAddress: "Permanent Address",
      };

      return {
        completed: totalScore === 100,
        score: totalScore,
        completedFields,
        remainingFields: Object.keys(fieldScores).filter(
          (field) => !completedFields.includes(field)
        ),
        nextField: nextField ? fieldLabels[nextField] : undefined,
      };
    },
  },
];

export function calculateProfileCompletion(profile: UserProfile): {
  percentage: number;
  rawScore: number;
  sections: {
    name: string;
    completed: boolean;
    score: number;
    completedFields?: string[];
    remainingFields?: string[];
    nextField?: string;
  }[];
} {
  const totalWeight = profileSections.reduce(
    (sum, section) => sum + section.weight,
    0
  );
  let totalScore = 0;

  const sections = profileSections.map((section) => {
    if (section.validator) {
      const result = section.validator(profile);
      totalScore += result.score;
      return {
        name: section.name,
        completed: result.completed,
        score: result.score,
        completedFields: result.completedFields,
        remainingFields: result.remainingFields,
        nextField: result.nextField,
      };
    } else {
      let sectionScore = 0;
      section.fields.forEach((field) => {
        const value = field.name.includes(".")
          ? field.name.split(".").reduce((obj, key) => obj?.[key], profile)
          : profile[field.name as keyof UserProfile];
        if (value !== undefined && value !== null && value !== "") {
          sectionScore += field.weight;
        }
      });
      totalScore += sectionScore;
      return {
        name: section.name,
        completed: sectionScore === section.weight,
        score: sectionScore,
      };
    }
  });

  return {
    percentage: Math.round((totalScore / totalWeight) * 100),
    rawScore: totalScore,
    sections,
  };
}
