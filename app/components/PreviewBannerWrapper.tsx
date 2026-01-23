import { draftMode } from 'next/headers';
import { PreviewBanner } from './PreviewBanner';

interface PreviewBannerWrapperProps {
  currentPath: string;
}

export async function PreviewBannerWrapper({ currentPath }: PreviewBannerWrapperProps) {
  const { isEnabled } = await draftMode();

  if (!isEnabled) {
    return null;
  }

  return <PreviewBanner currentPath={currentPath} />;
}
