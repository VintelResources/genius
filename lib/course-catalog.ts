export type LearnerBand = "toddlers" | "primary" | "secondary" | "tertiary";

export type ExamQuestion = {
  prompt: string;
  options: [string, string, string, string];
  correctAnswer: string;
};

export type CourseLesson = {
  id: string;
  title: string;
  summary: string;
  duration: string;
  lessonContent: string;
  keyPoints: string[];
  lessonVideoEmbedUrl?: string;
  lessonQuizTitle?: string;
  lessonQuizQuestions?: ExamQuestion[];
  moduleExamQuestions: ExamQuestion[];
};

export type CatalogCourse = {
  id: string;
  provider: "Inhouse Curriculum";
  providerUrl: string;
  band: LearnerBand;
  title: string;
  description: string;
  subject: string;
  sourceLabel: string;
  lessons: CourseLesson[];
};

export const REWARD_PER_CORRECT = 0.00000001;

function mcq(
  prompt: string,
  options: [string, string, string, string],
  correctAnswer: string
): ExamQuestion {
  return { prompt, options, correctAnswer };
}

export const COURSE_CATALOG: CatalogCourse[] = [
  {
    id: "toddlers-english",
    provider: "Inhouse Curriculum",
    providerUrl: "",
    band: "toddlers",
    title: "Toddlers English Foundations",
    description: "Letters, sounds, simple words, and playful language discovery.",
    subject: "English",
    sourceLabel: "Inhouse Toddlers Curriculum",
    lessons: [
      {
        id: "te-1",
        title: "Letter Sounds",
        summary: "Learn how letters connect with simple sounds.",
        duration: "8 min",
        lessonContent:
          "This module introduces toddlers to basic letter sounds. Learners hear and repeat sounds linked to familiar letters such as A, B, and C. The goal is to help them connect what they see with what they hear.",
        keyPoints: [
          "Letters can make sounds.",
          "Sounds help build words.",
          "Repeating sounds improves memory."
        ],
        lessonQuizTitle: "Letter Sounds Quick Quiz",
        lessonQuizQuestions: [
          mcq("Which letter often starts the word apple?", ["A", "B", "C", "D"], "A"),
          mcq("Which letter often starts the word ball?", ["A", "B", "C", "D"], "B"),
          mcq("Which sound matches C in cat?", ["Kuh", "Buh", "Mmm", "Lll"], "Kuh"),
          mcq("Which letter comes after B?", ["A", "B", "C", "D"], "C"),
          mcq("Which sound helps build words?", ["Letter sounds", "Car sounds", "Bell sounds", "Rain sounds"], "Letter sounds")
        ],
        moduleExamQuestions: [
          mcq("Which letter often starts the word apple?", ["A", "B", "C", "D"], "A"),
          mcq("Which letter often starts the word ball?", ["A", "B", "C", "D"], "B"),
          mcq("Which letter often starts the word cat?", ["A", "B", "C", "D"], "C"),
          mcq("Which sound matches B?", ["Buh", "Tuh", "Mmm", "Sss"], "Buh"),
          mcq("Which sound matches A in apple?", ["Ah", "Zzz", "Rrr", "Puh"], "Ah"),
          mcq("Which letter often starts dog?", ["D", "G", "L", "P"], "D"),
          mcq("Which sound matches C in cat?", ["Kuh", "Buh", "Mmm", "Lll"], "Kuh"),
          mcq("Which letter comes after A?", ["B", "C", "D", "E"], "B"),
          mcq("Which letter comes after B?", ["C", "D", "A", "F"], "C"),
          mcq("Which sound helps build words?", ["Letter sounds", "Car sounds", "Bell sounds", "Rain sounds"], "Letter sounds")
        ]
      }
    ]
  },
  {
    id: "secondary-physics",
    provider: "Inhouse Curriculum",
    providerUrl: "",
    band: "secondary",
    title: "Secondary Physics",
    description: "Motion, force, energy, and waves.",
    subject: "Physics",
    sourceLabel: "Inhouse Secondary Curriculum",
    lessons: [
      {
        id: "sp-1",
        title: "Motion",
        summary: "Understand speed, distance, time, and acceleration.",
        duration: "15 min",
        lessonContent:
          "This module introduces how movement is measured and described in physics.",
        keyPoints: [
          "Motion describes change in position.",
          "Speed links distance and time.",
          "Acceleration is change in velocity."
        ],
        lessonVideoEmbedUrl: "https://www.youtube.com/embed/I9AsgXVC3mM",
        lessonQuizTitle: "Motion Lesson Quiz",
        lessonQuizQuestions: [
          mcq("Speed is distance divided by what?", ["Time", "Mass", "Force", "Volume"], "Time"),
          mcq("Acceleration is change in what?", ["Velocity", "Color", "Shape", "Density"], "Velocity"),
          mcq("If distance stays same but time increases, speed does what?", ["Decreases", "Increases", "Disappears", "Freezes"], "Decreases"),
          mcq("A moving object changes its what?", ["Position", "Color", "Mass", "Taste"], "Position"),
          mcq("Motion can be represented on a what?", ["Graph", "Recipe", "Leaf", "Photo"], "Graph")
        ],
        moduleExamQuestions: [
          mcq("Speed is distance divided by what?", ["Time", "Mass", "Force", "Volume"], "Time"),
          mcq("Acceleration is change in what?", ["Velocity", "Color", "Shape", "Density"], "Velocity"),
          mcq("If distance stays same but time increases, speed does what?", ["Decreases", "Increases", "Disappears", "Freezes"], "Decreases"),
          mcq("A moving object changes its what?", ["Position", "Color", "Mass", "Taste"], "Position"),
          mcq("The SI unit for speed often uses meters per what?", ["Second", "Joule", "Newton", "Volt"], "Second"),
          mcq("Acceleration can be caused by a change in speed or what else?", ["Direction", "Color", "Weight", "Temperature"], "Direction"),
          mcq("If an object is not moving, its speed is what?", ["Zero", "Ten", "Infinite", "Unknown"], "Zero"),
          mcq("Distance measures how much what is covered?", ["Ground", "Sound", "Force", "Heat"], "Ground"),
          mcq("Time is measured with what kind of tool?", ["Clock", "Scale", "Magnet", "Ruler"], "Clock"),
          mcq("Motion can be represented on a what?", ["Graph", "Recipe", "Leaf", "Photo"], "Graph")
        ]
      },
      {
        id: "sp-2",
        title: "Force and Work",
        summary: "Learn force, Newtons, inertia, and work.",
        duration: "15 min",
        lessonContent:
          "This module explains how forces affect motion and how work is done when force causes movement.",
        keyPoints: [
          "Force changes motion.",
          "Inertia resists change.",
          "Work links force and distance."
        ],
        moduleExamQuestions: [
          mcq("The SI unit of force is what?", ["Newton", "Joule", "Watt", "Volt"], "Newton"),
          mcq("Newton’s first law is also called the law of what?", ["Inertia", "Light", "Heat", "Charge"], "Inertia"),
          mcq("Work is force multiplied by what?", ["Distance", "Mass", "Time", "Area"], "Distance"),
          mcq("A push or pull is called what?", ["Force", "Energy", "Mass", "Light"], "Force"),
          mcq("Inertia means an object resists changes in what?", ["Motion", "Color", "Temperature", "Volume"], "Motion"),
          mcq("A stronger force often causes greater what?", ["Change", "Silence", "Rest only", "Color"], "Change"),
          mcq("Work is done when force causes what?", ["Movement", "Sound only", "Heat only", "Stillness"], "Movement"),
          mcq("Mass often affects how much inertia an object has. More mass means what?", ["More inertia", "Less inertia", "No inertia", "No motion"], "More inertia"),
          mcq("A force can speed up, slow down, or change what?", ["Direction", "Size", "Age", "Material"], "Direction"),
          mcq("Friction is a force that often opposes what?", ["Motion", "Light", "Sound", "Heat"], "Motion")
        ]
      },
      {
        id: "sp-3",
        title: "Energy and Waves",
        summary: "Explore energy, sound, and wave motion.",
        duration: "15 min",
        lessonContent:
          "This module introduces major forms of energy and how waves transfer energy.",
        keyPoints: [
          "Energy can change form.",
          "Waves transfer energy.",
          "Sound needs a medium."
        ],
        moduleExamQuestions: [
          mcq("Potential energy due to height is called what?", ["Gravitational potential energy", "Chemical energy", "Sound energy", "Nuclear energy"], "Gravitational potential energy"),
          mcq("A wave’s frequency is measured in what?", ["Hertz", "Meters", "Newtons", "Liters"], "Hertz"),
          mcq("Sound cannot travel through what?", ["Vacuum", "Air", "Water", "Steel"], "Vacuum"),
          mcq("Energy cannot be created or destroyed. This is the law of what?", ["Conservation of energy", "Motion", "Inertia", "Gravity"], "Conservation of energy"),
          mcq("Sound is a type of what?", ["Wave", "Metal", "Rock", "Color"], "Wave"),
          mcq("A wave transfers what?", ["Energy", "Only matter", "Only mass", "Only weight"], "Energy"),
          mcq("The loudness of sound is linked to what?", ["Amplitude", "Taste", "Pressure only", "Color"], "Amplitude"),
          mcq("A vacuum has no what for sound to travel through?", ["Medium", "Energy", "Light", "Color"], "Medium"),
          mcq("Energy in food is mainly what type?", ["Chemical", "Elastic", "Sound", "Magnetic"], "Chemical"),
          mcq("Waves can be described by wavelength and what else?", ["Frequency", "Price", "Mass", "Radius"], "Frequency")
        ]
      }
    ]
  }
];

export function groupCoursesByBand() {
  return {
    toddlers: COURSE_CATALOG.filter((course) => course.band === "toddlers"),
    primary: COURSE_CATALOG.filter((course) => course.band === "primary"),
    secondary: COURSE_CATALOG.filter((course) => course.band === "secondary"),
    tertiary: COURSE_CATALOG.filter((course) => course.band === "tertiary")
  };
}

export function getCourse(courseId: string) {
  return COURSE_CATALOG.find((course) => course.id === courseId) ?? null;
}

