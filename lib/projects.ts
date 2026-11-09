export type Project = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
};

export const projects: Project[] = [
  {
    slug: "task-manager-app",
    title: "Task Manager App",
    description:
      "A full-stack task manager where users can create projects, add tasks with due dates, and track completion progress in real time.",
    techStack: ["React", "Next.js", "Node.js", "MongoDB"],
    features: [
      "Create, edit, and delete tasks with due dates",
      "Progress dashboard that updates in real time",
      "Filter tasks by status and priority",
      "User authentication with sessions",
    ],
  },
  {
    slug: "weather-dashboard",
    title: "Weather Dashboard",
    description:
      "A weather dashboard that consumes a public REST API to show current conditions and a 7-day forecast for any city the user searches.",
    techStack: ["JavaScript", "REST API", "CSS Grid"],
    features: [
      "Search current weather by city name",
      "7-day forecast with temperature charts",
      "Geolocation support for local weather",
      "Responsive layout that works on mobile",
    ],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
