-- Found via a post-fix Supabase security advisor scan run immediately after
-- 20260718000000_security_hardening.sql was applied to the live project
-- (upgzorwatmvvuemxceyx) on 2026-07-19. Not present in any earlier local
-- migration file — this was live-only drift, presumably left over from
-- manual debugging directly against the dashboard.
--
-- "Temporary debug policy - REMOVE AFTER TESTING" on academic_test_results
-- gave every authenticated user unrestricted read/write access to every
-- student's test results and grades (USING and WITH CHECK both `true`,
-- FOR ALL). The legitimate self/teacher-scoped policies on this table
-- (Students can view/update their own results, Teachers can view/update
-- results for their own tests) were already correct and are untouched.
DROP POLICY IF EXISTS "Temporary debug policy - REMOVE AFTER TESTING" ON academic_test_results;

-- Tighten EXECUTE grants on the two functions added by the prior
-- migration: the default PUBLIC grant (which includes anon) isn't needed
-- for either. is_staff still needs an explicit grant to `authenticated`
-- because RLS policies that call it are evaluated as the querying role.
-- The trigger function needs no role-level grant at all — Postgres invokes
-- triggers via the trigger mechanism regardless of EXECUTE grants.
REVOKE EXECUTE ON FUNCTION is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_staff(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION prevent_profile_self_escalation() FROM PUBLIC;
