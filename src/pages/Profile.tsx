import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeSegmented } from '@/components/layout/ThemeToggle';
import { Card, CardBody } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  return (
    <div className="container-page">
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        description="Edit your eligibility profile and preferences."
      />
      <Card as="section" aria-labelledby="appearance-heading">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="appearance-heading" className="text-lg font-semibold">
              Appearance
            </h2>
            <p className="text-sm text-muted">Choose light, dark, or follow your device.</p>
          </div>
          <ThemeSegmented />
        </CardBody>
      </Card>
    </div>
  );
}
