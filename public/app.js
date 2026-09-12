const form = document.getElementById('authForm');
const submitBtn = document.getElementById('submitBtn');
const timeline = document.getElementById('timeline');
const resultCard = document.getElementById('resultCard');
const probValue = document.getElementById('probValue');
const statusPill = document.getElementById('statusPill');
const missingBox = document.getElementById('missingBox');
const missingList = document.getElementById('missingList');
const addDocsBtn = document.getElementById('addDocsBtn');
const extraDocsInput = document.getElementById('extraDocs');

let currentRequestId = null;

function resetTimeline() {
  document.querySelectorAll('.tl-item').forEach(li => {
    li.classList.remove('active', 'done');
    li.querySelector('p').textContent = '\u00A0';
  });
  resultCard.classList.add('hidden');
}

// Reveal steps one at a time so the agent hand-off is visible, even though
// the backend already computed the full result synchronously.
function playTimeline(steps) {
  return new Promise(resolve => {
    let i = 0;
    function next() {
      if (i > 0) {
        const prevLi = timeline.querySelector(`[data-key="${steps[i - 1].key}"]`);
        prevLi.classList.add('done');
      }
      if (i >= steps.length) return resolve();
      const step = steps[i];
      const li = timeline.querySelector(`[data-key="${step.key}"]`);
      li.classList.add('active');
      li.querySelector('p').textContent = step.detail;
      i++;
      setTimeout(next, 550);
    }
    next();
  });
}

function renderResult(data) {
  resultCard.classList.remove('hidden');
  probValue.textContent = `${data.decision.probability}%`;

  statusPill.classList.remove('approved', 'needs-info', 'denied');
  if (data.decision.status === 'APPROVED') {
    statusPill.textContent = 'Approved';
    statusPill.classList.add('approved');
  } else if (data.decision.status === 'NEEDS_MORE_INFO') {
    statusPill.textContent = 'More info needed';
    statusPill.classList.add('needs-info');
  } else {
    statusPill.textContent = 'Likely to be denied';
    statusPill.classList.add('denied');
  }

  if (data.decision.missing.length > 0) {
    missingBox.classList.remove('hidden');
    missingList.innerHTML = data.decision.missing.map(m => `<li>${m}</li>`).join('');
  } else {
    missingBox.classList.add('hidden');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';
  resetTimeline();

  const formData = new FormData(form);
  formData.set('hasConservativeTherapyDocs', form.hasConservativeTherapyDocs.checked ? 'true' : 'false');

  try {
    const res = await fetch('/api/prior-auth/submit', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');

    currentRequestId = data.id;
    await playTimeline(data.steps);
    document.querySelector('[data-key="decision"]').classList.add('done');
    renderResult(data);
  } catch (err) {
    alert(`Something went wrong: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Request';
  }
});

addDocsBtn.addEventListener('click', async () => {
  if (!currentRequestId) return;
  addDocsBtn.disabled = true;
  addDocsBtn.textContent = 'Rechecking…';

  const fd = new FormData();
  Array.from(extraDocsInput.files).forEach(f => fd.append('documents', f));

  try {
    const res = await fetch(`/api/prior-auth/${currentRequestId}/add-documents`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    renderResult(data);
  } catch (err) {
    alert(`Something went wrong: ${err.message}`);
  } finally {
    addDocsBtn.disabled = false;
    addDocsBtn.textContent = 'Add documents & recheck';
  }
});
