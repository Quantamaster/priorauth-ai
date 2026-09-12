#  Insurance — Agentic Prior Authorization 

A working demo of the multi-agent prior-authorization workflow from the pitch deck.
Sarah's knee-MRI journey is pre-filled in the form as a walkthrough.

## What's actually happening

- **Backend** (`server.js`): a small Express API with four functions standing in
  for the Medical, Insurance, Decision, and Coordinator agents. They use simple
  keyword-matching (not a real OCR/LLM) so the whole thing runs instantly and
  offline — good enough to demo the *workflow* and *logic*, not production-grade
  medical coding.
- **Frontend** (`public/`): plain HTML/CSS/JS. Submits the form to the backend,
  then animates through the 5-step timeline as the response comes back, shows an
  approval-probability ring, and — if more documents are needed — lets you upload
  them and re-run the check live.

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## Try the demo flow

1. Leave the form as pre-filled (Sarah's case) and leave the PT-records checkbox
   **unchecked**, then click **Submit Request**.
2. Watch the timeline animate through all 5 agent steps.
3. You'll land around ~70% probability with "More info needed" — it will ask for
   6 weeks of conservative therapy records, just like in the deck.
4. Attach any file under "Add documents & recheck" (the content isn't parsed —
   attaching *anything* here simulates having the PT records) and click the button.
5. Probability jumps to ~97% and the status flips to **Approved**.

## Extending this into something real

- Swap the in-memory `Map` in `server.js` for a real database.
- Replace the keyword matchers (`ICD10_MAP`, `CPT_MAP`) with a real medical NLP /
  coding service, or wire in Textract (as in the original pitch) for OCR.
- Replace `insuranceAgent`'s hardcoded step-therapy rule with an actual policy
  rules engine per plan.
- Add auth (this demo has none — don't deploy it as-is).
