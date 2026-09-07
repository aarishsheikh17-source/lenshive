# End-to-end test of a photographer account

Goal: create a real test photographer account and walk through the whole photographer experience, fixing anything that breaks along the way.

## What I'll do

1. Create a test photographer account (email + password, signing up as "Photographer") and sign in.
2. Open the dashboard and check the overview loads with the right empty states for a brand-new account.
3. Set pricing (hourly / half-day / full-day) and confirm it saves and reloads correctly.
4. Upload a portfolio photo, confirm it appears, then delete one and confirm it disappears.
5. Fill in the profile (bio, city, specialities) and flip the publish switch on.
6. Sign out and check the published photographer now shows up on the browse page and their public profile page, with pricing and photos visible to a visitor.
7. Note and fix any errors found; re-test after each fix.

## Notes

- This creates one real test account and one published test listing in the live data. I'll tell you the email used, and I can remove the account and its listing at the end if you'd prefer the data stays clean.
- Photo upload needs a sample image; I'll use a generated placeholder photo, not a real portfolio.

## Technical detail

Driven through a headless browser against the running app at localhost:8080, covering `/auth`, `/dashboard` (pricing, portfolio, edit profile), `/browse`, and `/photographers/$id`. Checks include the `portfolios` storage bucket upload + signed URL path, `pricing` and `portfolio_items` row writes under RLS, and the anon-visible published profile read path.
