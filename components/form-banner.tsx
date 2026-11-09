type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function FormBanner({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { submitted, error } = await searchParams;

  if (submitted) {
    return (
      <p className="banner success" role="status">
        Thanks! Your message was saved successfully.
      </p>
    );
  }

  if (error) {
    return (
      <p className="banner error" role="alert">
        Please fill in every field and use a valid email address.
      </p>
    );
  }

  return null;
}
