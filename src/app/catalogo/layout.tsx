
// This is a new layout file specific to the catalog page.
// It ensures that the catalog page does not use the main AppShell,
// making it a truly public page without navigation, authentication, or other contexts.
export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
