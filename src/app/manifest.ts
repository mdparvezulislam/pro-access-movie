import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PRO ACCESS MOVIE",
    short_name: "PRO ACCESS",
    description: "Bangladesh-focused premium movie & TV series streaming application",
    start_url: "/",
    display: "standalone",
    background_color: "#09090e",
    theme_color: "#e50914",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
