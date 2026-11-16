export const STT_MODELS = [
  "nova-3",
  "nova-2",
  "nova-2-conversationalai",
  "nova-2-meeting",
  "base",
] as const;

export type SttModelId = (typeof STT_MODELS)[number];

export interface SttModelOption {
  id: SttModelId;
  label: string;
  description: string;
}

export const STT_MODEL_OPTIONS: readonly SttModelOption[] = [
  {
    id: "nova-3",
    label: "Nova 3",
    description: "Highest accuracy, general purpose. Best default for interview answers.",
  },
  {
    id: "nova-2",
    label: "Nova 2",
    description: "Previous-gen general purpose model.",
  },
  {
    id: "nova-2-conversationalai",
    label: "Nova 2 · Conversational AI",
    description: "Tuned for back-and-forth spoken conversation, good for Q&A style interviews.",
  },
  {
    id: "nova-2-meeting",
    label: "Nova 2 · Meeting",
    description: "Tuned for multi-speaker audio, useful for panel-style mock interviews.",
  },
  {
    id: "base",
    label: "Base",
    description: "Lightweight fallback model.",
  },
];

export const DEFAULT_STT_MODEL: SttModelId = "nova-3";

export const VOICE_MODELS = [
  "aura-2-thalia-en",
  "aura-2-arcas-en",
  "aura-2-orion-en",
  "aura-2-athena-en",
  "aura-2-draco-en",
  "aura-2-aurora-en",
  "aura-2-delia-en",
  "aura-2-hyperion-en",
  "aura-2-juno-en",
  "aura-2-ophelia-en",
  "aura-2-pluto-en",
  "aura-2-vesta-en",
] as const;

export type VoiceId = (typeof VOICE_MODELS)[number];

export type InterviewRole =
  | "hr"
  | "technical"
  | "mentor"
  | "behavioral"
  | "system-design"
  | "managerial";

  
export interface VoiceOption {
  id: VoiceId;
  name: string;
  gender: "masculine" | "feminine";
  accent: string;
  characteristics: string[];
  useCases: string[];
  previewText: string;
  role: InterviewRole;
  personality: string;
  avatar: string;
}

export const VOICE_OPTIONS: readonly VoiceOption[] = [
  {
    id: "aura-2-thalia-en",
    name: "Thalia",
    gender: "feminine",
    accent: "American",
    characteristics: ["Clear", "Confident", "Energetic", "Enthusiastic"],
    useCases: ["Casual chat", "Customer service", "IVR"],
    previewText:
      "Hello! I'm Thalia. I'll be conducting today's interview. Let's begin whenever you're ready.",
    role: "hr",
    personality:
      "Friendly, confident and encouraging HR interviewer who makes candidates feel comfortable.",
    avatar: "/avatars/thalia.glb",
  },

  {
    id: "aura-2-arcas-en",
    name: "Arcas",
    gender: "masculine",
    accent: "American",
    characteristics: ["Natural", "Smooth", "Clear", "Comfortable"],
    useCases: ["Customer service", "Casual chat"],
    previewText:
      "Hi! I'm Arcas. Relax and answer naturally. I'm here to help you practice.",
    role: "mentor",
    personality:
      "Patient mentor who gives guidance, feedback and confidence during practice sessions.",
    avatar: "/avatars/arcas.glb",
  },

  {
    id: "aura-2-orion-en",
    name: "Orion",
    gender: "masculine",
    accent: "American",
    characteristics: ["Approachable", "Comfortable", "Calm", "Polite"],
    useCases: ["Informative"],
    previewText:
      "Welcome! I'm Orion. Let's work through this technical interview step by step.",
    role: "technical",
    personality:
      "Logical, calm and analytical interviewer focused on problem-solving and technical discussions.",
    avatar: "/avatars/orion.glb",
  },
  
  {
    id: "aura-2-athena-en",
    name: "Athena",
    gender: "feminine",
    accent: "American",
    characteristics: ["Calm", "Smooth", "Professional"],
    useCases: ["Storytelling"],
    previewText:
      "Hello, I'm Athena. I'd like to understand your experience through thoughtful conversation.",
    role: "hr",
    personality:
      "Professional HR interviewer who focuses on communication, leadership and behavioral questions.",
    avatar: "/avatars/athena.glb",
  },

  {
    id: "aura-2-draco-en",
    name: "Draco",
    gender: "masculine",
    accent: "British",
    characteristics: ["Warm", "Approachable", "Trustworthy", "Baritone"],
    useCases: ["Storytelling"],
    previewText:
      "Good day. I'm Draco. Let's have a professional discussion about your technical expertise.",
    role: "technical",
    personality:
      "Senior technical interviewer who asks deep engineering questions with a calm tone.",
    avatar: "/avatars/draco.glb",
  },

  {
    id: "aura-2-aurora-en",
    name: "Aurora",
    gender: "feminine",
    accent: "American",
    characteristics: ["Cheerful", "Expressive", "Energetic"],
    useCases: ["Interview"],
    previewText:
      "Hi! I'm Aurora. Let's make this mock interview engaging and enjoyable.",
    role: "mentor",
    personality:
      "Positive coach who motivates candidates while helping them improve communication skills.",
    avatar: "/avatars/aurora.glb",
  },

  {
    id: "aura-2-delia-en",
    name: "Delia",
    gender: "feminine",
    accent: "American",
    characteristics: ["Casual", "Friendly", "Cheerful", "Breathy"],
    useCases: ["Interview"],
    previewText:
      "Hello! I'm Delia. Take a deep breath and answer confidently. You've got this.",
    role: "mentor",
    personality:
      "Friendly mentor focused on reducing interview anxiety and building confidence.",
    avatar: "/avatars/delia.glb",
  },

  {
    id: "aura-2-hyperion-en",
    name: "Hyperion",
    gender: "masculine",
    accent: "Australian",
    characteristics: ["Caring", "Warm", "Empathetic"],
    useCases: ["Interview"],
    previewText:
      "Hi! I'm Hyperion. Let's evaluate your problem-solving skills together.",
    role: "technical",
    personality:
      "Empathetic technical interviewer who values reasoning more than memorized answers.",
    avatar: "/avatars/hyperion.glb",
  },

  {
    id: "aura-2-juno-en",
    name: "Juno",
    gender: "feminine",
    accent: "American",
    characteristics: ["Natural", "Engaging", "Melodic", "Breathy"],
    useCases: ["Interview"],
    previewText:
      "Welcome! I'm Juno. Let's have an interactive interview session today.",
    role: "hr",
    personality:
      "Conversational HR interviewer who evaluates communication, teamwork and confidence.",
    avatar: "/avatars/juno.glb",
  },

  {
    id: "aura-2-ophelia-en",
    name: "Ophelia",
    gender: "feminine",
    accent: "American",
    characteristics: ["Expressive", "Enthusiastic", "Cheerful"],
    useCases: ["Interview"],
    previewText:
      "Hello! I'm Ophelia. Let's begin with a few questions about yourself.",
    role: "hr",
    personality:
      "Energetic interviewer who creates a lively and engaging interview atmosphere.",
    avatar: "/avatars/ophelia.glb",
  },

  {
    id: "aura-2-pluto-en",
    name: "Pluto",
    gender: "masculine",
    accent: "American",
    characteristics: ["Smooth", "Calm", "Empathetic", "Baritone"],
    useCases: ["Interview", "Storytelling"],
    previewText:
      "Hi! I'm Pluto. Today I'll evaluate your software engineering fundamentals.",
    role: "technical",
    personality:
      "Experienced senior engineer who asks practical coding and system design questions.",
    avatar: "/avatars/pluto.glb",
  },

  {
    id: "aura-2-vesta-en",
    name: "Vesta",
    gender: "feminine",
    accent: "American",
    characteristics: ["Natural", "Expressive", "Patient", "Empathetic"],
    useCases: ["Customer service", "Interview", "Storytelling"],
    previewText:
      "Hello! I'm Vesta. I'll guide you through today's interview and provide helpful feedback afterward.",
    role: "mentor",
    personality:
      "Supportive AI coach who provides constructive feedback after every interview session.",
    avatar: "/avatars/vesta.glb",
  },
];

export const DEFAULT_VOICE: VoiceId = "aura-2-thalia-en";

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscribeResult {
  transcript: string;
  confidence: number;
  duration: number;
  words: TranscriptWord[];
}

export interface UploadedAudioFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

export interface AudioValidationResult {
  valid: boolean;
  reason?: string;
}