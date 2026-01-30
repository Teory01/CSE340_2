-- 1. Insert a new account record for Tony Stark
INSERT INTO public.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password
)
VALUES (
  'Tony',
  'Stark',
  'tony@starkent.com',
  'Iam1ronM@n'
);

-- 2. Modify Tony Stark's account_type to 'Admin'
-- Uses the primary key via a subquery
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = (
  SELECT account_id
  FROM account
  WHERE account_email = 'tony@starkent.com'
);

-- 3. Delete the Tony Stark account record
-- Uses the primary key via a subquery
DELETE FROM public.account
WHERE account_id = (
  SELECT account_id
  FROM account
  WHERE account_email = 'tony@starkent.com'
);

-- 4. Update the GM Hummer description
-- Replace 'small interiors' with 'a huge interior'
UPDATE public.inventory
SET inv_description = REPLACE(
  inv_description,
  'small interiors',
  'a huge interior'
)
WHERE inv_make = 'GM'
AND inv_model = 'Hummer';

-- 5. Select make, model, and classification name for Sport vehicles
SELECT
  i.inv_make,
  i.inv_model,
  c.classification_name
FROM inventory i
INNER JOIN classification c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. Update all image paths to include '/vehicles'
UPDATE public.inventory
SET
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
