
INSERT INTO public.course_content (product_id, lesson_number, title, description, downloadable_url)
SELECT 
  p.id,
  COALESCE((SELECT MAX(lesson_number) FROM public.course_content WHERE product_id = p.id), 0) + 1,
  'Manual de Chakras',
  'Material complementario sobre el sistema de chakras',
  'curso-chakras.pdf'
FROM public.products p
WHERE p.slug = 'curso-completo';
