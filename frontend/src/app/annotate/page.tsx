import AnnotationStudioWrapper from '@/components/AnnotationStudioWrapper';

export const metadata = {
  title: 'Image Annotation Studio | Epic Studio',
  description: 'Upload and draw polygons on images to build custom datasets.',
};

export default function AnnotatePage() {
  return (
    <main className="min-h-screen bg-[#0B0F19]">
      <AnnotationStudioWrapper />
    </main>
  );
}
