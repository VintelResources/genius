export async function getTutorResponse(prompt: string) {
  return `Tutor response: ${prompt}`;
}

export async function generateLessonContent(prompt: string) {
  return `Lesson content: ${prompt}`;
}

export async function generateExamContent(..._args: any[]) {
  return {
    questions: [
      {
        question: "What is the best way to learn a new topic?",
        options: ["Practice step by step", "Guess randomly", "Skip the basics", "Avoid revision"],
        correctIndex: 0,
        explanation: "Step-by-step practice builds stronger understanding.",
        type: "MULTIPLE_CHOICE"
      }
    ]
  };
}

export async function generateDiagnosticPath(..._args: any[]) {
  return {
    path: {
      id: "diagnostic-path",
      title: "Personal Learning Path",
      description: "A simple adaptive path based on your diagnostic result.",
      subject: "General Knowledge",
      difficulty: "BEGINNER",
      steps: [
        {
          id: "step-1",
          title: "Review the basics",
          description: "Start with the foundation before moving forward.",
          completed: false
        }
      ],
      progress: 0
    }
  };
}

export async function generateGlobalTrivia(..._args: any[]) {
  return {
    question: "Which habit improves learning the most?",
    options: ["Consistent practice", "Guessing", "Skipping lessons", "Ignoring feedback"],
    correctIndex: 0,
    explanation: "Consistent practice helps knowledge stick.",
    type: "MULTIPLE_CHOICE"
  };
}

export async function generateTextToSpeech(_text: string) {
  return "";
}

export function decode(base64: string) {
  if (!base64) return new Uint8Array();

  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  } catch {
    return new Uint8Array();
  }
}

export async function decodeAudioData(bytes: Uint8Array) {
  return bytes;
}

export function createBlob(parts: BlobPart[], type = "audio/mpeg") {
  return new Blob(parts, { type });
}



