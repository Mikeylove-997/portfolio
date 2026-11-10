export type Project = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  repoUrl: string;
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
    slug: "inventory-cli",
    title: "Store Inventory CLI",
    description:
      "A Python 3 command-line application for managing a small store's product inventory, with JSON persistence and robust input validation (ISBA 2438 Assignment 1).",
    techStack: ["Python", "argparse", "JSON"],
    features: [
      "Add, list, get, update, and delete products from the command line",
      "Low-stock report with configurable reorder thresholds",
      "All data persisted to a local JSON file with schema validation",
      "Strict input validation for names, prices, quantities, and IDs",
    ],
    repoUrl: "https://github.com/Mikeylove-997/inventory-cli",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
