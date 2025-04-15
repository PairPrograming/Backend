---CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO public."Rols" (id, rol, status) VALUES 
  (gen_random_uuid(), 'SuperAdministrador', true),
  (gen_random_uuid(), 'Administrador', true),
  (gen_random_uuid(), 'Vendedor', true),
  (gen_random_uuid(), 'Tutor', true),
  (gen_random_uuid(), 'Salón', true),
  (gen_random_uuid(), 'Punto de venta', true),
  (gen_random_uuid(), 'Raso', true),
  (gen_random_uuid(), 'Graduado', true);

INSERT INTO public."User_Types"(id, usertype, status) VALUES
	(gen_random_uuid(), 'Natural', true),
  (gen_random_uuid(), 'Juridica', true);