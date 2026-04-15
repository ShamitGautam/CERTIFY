CREATE OR REPLACE FUNCTION public.submit_certificate_request(
  p_student_name text,
  p_certificate_title text,
  p_organisation_name text,
  p_course_name text,
  p_institution text,
  p_date_completed text,
  p_certificate_pdf_name text,
  p_certificate_pdf_data_url text
)
RETURNS public.certificate_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_request public.certificate_requests;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.certificate_requests (
    student_id,
    student_name,
    certificate_title,
    organisation_name,
    course_name,
    institution,
    date_completed,
    certificate_pdf_name,
    certificate_pdf_data_url
  )
  VALUES (
    auth.uid(),
    p_student_name,
    p_certificate_title,
    p_organisation_name,
    p_course_name,
    p_institution,
    p_date_completed,
    p_certificate_pdf_name,
    p_certificate_pdf_data_url
  )
  RETURNING * INTO new_request;

  RETURN new_request;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_certificate_request(
  text,
  text,
  text,
  text,
  text,
  text,
  text
) TO authenticated;

ALTER TABLE public.certificate_requests
  ADD COLUMN IF NOT EXISTS certificate_pdf_name text,
  ADD COLUMN IF NOT EXISTS certificate_pdf_data_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificate-pdfs', 'certificate-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Authenticated users can upload certificate PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificate-pdfs');

CREATE POLICY "Public can view certificate PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'certificate-pdfs');

CREATE POLICY "Authenticated users can update certificate PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'certificate-pdfs')
WITH CHECK (bucket_id = 'certificate-pdfs');