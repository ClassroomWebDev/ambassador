REVOKE ALL ON FUNCTION public.leaderboard_top(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_leaderboard_rank() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leaderboard_top(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_leaderboard_rank() TO authenticated;
