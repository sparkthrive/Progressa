-- Function to increment group member count
create or replace function increment_group_member_count(group_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update groups
  set current_members = current_members + 1
  where id = group_id;
end;
$$;

-- Function to decrement group member count
create or replace function decrement_group_member_count(group_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update groups
  set current_members = current_members - 1
  where id = group_id;
end;
$$;
