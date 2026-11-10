export type Project = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  repoUrl: string;
  liveUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "payactiv-ewa-api",
    title: "Payactiv EWA Prediction API",
    description:
      "SCU practicum project: a machine learning service that identifies users in financial distress and predicts Early Wage Access product usage frequency, served through a documented REST API.",
    techStack: ["Python", "scikit-learn", "REST API", "MCP"],
    features: [
      "ML models for financial-distress risk and EWA usage-frequency prediction",
      "REST API with Procfile ready for cloud deployment",
      "Model Context Protocol (MCP) server for AI tool integration",
      "API documentation, integration, and validation reports",
    ],
    repoUrl: "https://github.com/Mikeylove-997/payactiv-ewa-api",
  },
  {
    slug: "company-brain",
    title: "Financial Company Brain",
    description:
      "A Streamlit analytics app that explains why profit missed budget in seconds: Python does the variance math, HydraDB retrieves the reasons from company documents, and every claim cites its source. When no document explains a number, it says so.",
    techStack: ["Python", "Streamlit", "HydraDB", "LLM"],
    features: [
      "Driver-by-driver breakdown of budget-vs-actual misses with evidence ratings",
      "Retrieves and cites the exact document sections behind each claim",
      "Guardrails flag insufficient evidence and list every correction made to the answer",
      "Deployed live on Streamlit Cloud, with a CLI and test suite",
    ],
    repoUrl: "https://github.com/Mikeylove-997/Company-brain",
    liveUrl: "https://ridgeline-company-brain.streamlit.app/",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
