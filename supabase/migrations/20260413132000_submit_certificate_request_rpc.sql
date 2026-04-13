CREATE OR REPLACE FUNCTION public.submit_certificate_request(
  p_student_name text,
  p_certificate_title text,
  p_organisation_name text,
  p_course_name text,
  p_institution text,
  p_date_completed text
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
    date_completed
  )
  VALUES (
    auth.uid(),
    p_student_name,
    p_certificate_title,
    p_organisation_name,
    p_course_name,
    p_institution,
    p_date_completed
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
  text
) TO authenticated;