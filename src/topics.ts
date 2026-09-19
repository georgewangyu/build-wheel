export type Topic = {
  id: string;
  slug: string;
  title: string;
  wheelLabel: string;
  category: 'AI systems' | 'Human connection' | 'Personal augmentation' | 'Playful projects';
  prompt: string;
};

// Public display copy only. IDs and slugs are stable keys for shared results.
export const topics: readonly Topic[] = [
  { id: 'launch-ai-01', slug: 'personal-ai-operator-agent-harness', title: 'AI Agent Harness', wheelLabel: 'AGENT HARNESS', category: 'AI systems', prompt: 'The system around an AI agent that gives it tools, routes tasks, coordinates specialists, and keeps track of the work.' },
  { id: 'launch-ai-02', slug: 'ai-memory-life-os', title: 'AI Memory / Life OS', wheelLabel: 'AI MEMORY', category: 'AI systems', prompt: 'Search conversations, photos, locations, notes, and decisions as one memory system.' },
  { id: 'launch-ai-03', slug: 'ai-research-radar', title: 'AI Research Radar', wheelLabel: 'RESEARCH RADAR', category: 'AI systems', prompt: 'Continuously find emerging technologies, creators, products, and trends before they become obvious.' },
  { id: 'launch-ai-04', slug: 'ai-video-editor', title: 'AI Video Editor', wheelLabel: 'AI VIDEO EDITOR', category: 'AI systems', prompt: 'Turn raw footage into a structured first cut with captions, music, and visual assets.' },
  { id: 'launch-connection-01', slug: 'voice-only-social-app', title: 'Voice-Only Social App', wheelLabel: 'VOICE SOCIAL', category: 'Human connection', prompt: 'A social network built around reciprocal voice conversations.' },
  { id: 'launch-connection-02', slug: 'friend-to-irl-matchmaker', title: 'Friend-to-IRL Matchmaker', wheelLabel: 'FRIEND TO IRL', category: 'Human connection', prompt: 'Help compatible people progress from strangers online to doing something together offline.' },
  { id: 'launch-connection-03', slug: 'digital-third-place', title: 'Digital Third Place', wheelLabel: 'THIRD PLACE', category: 'Human connection', prompt: 'A small online space where the same people repeatedly gather and actually know each other.' },
  { id: 'launch-connection-04', slug: 'creator-collaboration-network', title: 'Creator Collaboration Network', wheelLabel: 'CREATOR COLLAB', category: 'Human connection', prompt: 'Match creators who could make something meaningfully better together.' },
  { id: 'launch-augmentation-01', slug: 'personalized-health-app', title: 'Personalized Health App', wheelLabel: 'HEALTH APP', category: 'Personal augmentation', prompt: "Turn someone's health data into one useful recommendation for today." },
  { id: 'launch-augmentation-02', slug: 'adhd-momentum-coach', title: 'ADHD Momentum Coach', wheelLabel: 'ADHD COACH', category: 'Personal augmentation', prompt: 'Identify the smallest useful next action when someone feels stuck.' },
  { id: 'launch-augmentation-03', slug: 'personal-energy-dashboard', title: 'Personal Energy Dashboard', wheelLabel: 'ENERGY MAP', category: 'Personal augmentation', prompt: 'Predict when someone should work, exercise, socialize, or recover.' },
  { id: 'launch-augmentation-04', slug: 'ai-speaking-coach', title: 'AI Speaking Coach', wheelLabel: 'SPEAKING COACH', category: 'Personal augmentation', prompt: 'Give someone a topic, record their explanation, and show them how to communicate it better.' },
  { id: 'launch-playful-01', slug: 'retro-monster-rpg', title: 'Retro Monster RPG', wheelLabel: 'MONSTER RPG', category: 'Playful projects', prompt: 'Build a tiny original monster-catching world.' },
  { id: 'launch-playful-02', slug: 'digital-pet', title: 'Digital Pet', wheelLabel: 'DIGITAL PET', category: 'Playful projects', prompt: 'Create a character whose personality and environment change based on how you treat it.' },
  { id: 'launch-playful-03', slug: 'ai-npc-life-simulator', title: 'AI NPC Life Simulator', wheelLabel: 'AI NPC LIFE', category: 'Playful projects', prompt: 'Give simulated characters memories, relationships, and lives that continue without you.' },
  { id: 'launch-playful-04', slug: 'rebuild-forgotten-tech', title: 'Rebuild Forgotten Tech', wheelLabel: 'FORGOTTEN TECH', category: 'Playful projects', prompt: 'Take an abandoned gadget or software concept and redesign it for 2026.' },
];
