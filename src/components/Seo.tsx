import { Helmet } from "react-helmet-async";
import { SITE as CANONICAL_SITE, OG_IMAGE } from "@/lib/routeMeta";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const Seo = ({ title, description, path, jsonLd }: SeoProps) => {
  // Always canonicalise to the production domain so the two hosted copies
  // (preview + Vercel) never compete as duplicate content.
  const url = `${CANONICAL_SITE}${path === "/" ? "/" : path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content="Journex Ai" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
