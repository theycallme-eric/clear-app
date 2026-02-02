# Skill: Debug Error
**Trigger:** When a build fails or the user reports a runtime error.

1.  **Read:** Read the exact error message from the terminal. Do not guess.
2.  **Locate:** Identify the file causing the error.
3.  **Analyze:**
    * **Type Error?** Check `src/types/database.ts` (Supabase types).
    * **Style Error?** Check `tailwind.config.js`.
    * **Import Error?** Did we move a file during extraction?
4.  **Fix:** Apply the fix and *run the build command again* to verify.
