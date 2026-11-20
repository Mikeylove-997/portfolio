export default function TechTags({ tags }: { tags: string[] }) {
  return (
    <ul className="pill-list">
      {tags.map((tech) => (
        <li key={tech} className="pill">
          {tech}
        </li>
      ))}
    </ul>
  );
}
