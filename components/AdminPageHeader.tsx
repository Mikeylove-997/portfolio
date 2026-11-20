import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminPageHeader({
  title,
  lead,
  backHref,
  backLabel = "← Admin",
}: {
  title: string;
  lead: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <>
      {backHref ? (
        <Link href={backHref} className="back-link">
          {backLabel}
        </Link>
      ) : null}
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
    </>
  );
}
