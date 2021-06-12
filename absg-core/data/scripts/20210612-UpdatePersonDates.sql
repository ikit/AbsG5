ALTER TABLE public.person ADD COLUMN "dateOfBirth2" character varying COLLATE pg_catalog."default";
ALTER TABLE public.person ADD COLUMN "dateOfDeath2" character varying COLLATE pg_catalog."default";

UPDATE public.person
SET "dateOfBirth2"=TO_CHAR("dateOfBirth"::DATE, 'yyyy.mm.dd')
WHERE "dateOfBirth" IS NOT NULL;

UPDATE public.person
SET "dateOfDeath2"=TO_CHAR("dateOfDeath"::DATE, 'yyyy.mm.dd')
WHERE "dateOfDeath" IS NOT NULL;

ALTER TABLE public.person DROP COLUMN "dateOfBirth";
ALTER TABLE public.person DROP COLUMN "dateOfDeath";

ALTER TABLE public.person RENAME COLUMN "dateOfBirth2" TO "dateOfBirth";
ALTER TABLE public.person RENAME COLUMN "dateOfDeath2" TO "dateOfDeath";