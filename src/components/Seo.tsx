import { Helmet } from "react-helmet-async";

const FALLBACK_SITE = "https://journexai.lovable.app";
// Self-referencing canonical: use the origin the page is actually served from
const SITE =
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin.replace(/\/$/, "")
    : FALLBACK_SITE;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const Seo = ({ title, description, path, jsonLd }: SeoProps) => {
  const url = `${SITE}${path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
