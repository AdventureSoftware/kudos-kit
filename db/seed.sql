-- db/seed.sql
-- Add your product project keys here
insert into projects (key, name) values
  ('colorpage', 'Colorpage'),
  ('productscene', 'ProductScene'),
  ('bizpage', 'BizPage')
on conflict (key) do nothing;
