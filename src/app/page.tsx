import { loadPortfolioContent } from '@/lib/content';
import PortfolioShell from '@/components/PortfolioShell';

/**
 * Server Component: loads and Zod-validates everything under content/,
 * then hands typed props to the client shell.
 */
export default function HomePage() {
  const content = loadPortfolioContent();
  return <PortfolioShell content={content} />;
}
