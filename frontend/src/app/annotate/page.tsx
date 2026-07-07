import { AnnotationStudio } from '@/components/AnnotationStudio';

export const metadata = {
  title: 'Image Annotation Studio | Epic Studio',
  description: 'Upload and draw polygons on images to build custom datasets.',
};

export default function AnnotatePage() {
  return <AnnotationStudio />;
}
