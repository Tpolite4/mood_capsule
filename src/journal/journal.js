export function initializeJournal() {
  let currentEntry = {
    emoji: '',
    feeling: '',
    quote: '',
  };

  function openJournalDropdown(emoji, feeling, quote) {
    const dropdown = document.getElementById('journalDropdown');
    const detectedInfo = document.getElementById('journalDetectedInfo');

    currentEntry = {
      emoji,
      feeling,
      quote,
    };

    detectedInfo.textContent = `${emoji} ${feeling} — "${quote}"`;
    document.getElementById('journalNote').value = '';
    dropdown.classList.add('open');
  }

  async function saveJournalEntry() {
    const note = document.getElementById('journalNote').value.trim();

    const entry = {
      ...currentEntry,
      note,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (res.ok) {
        document.getElementById('journalDropdown').classList.remove('open');

        console.log('Journal entry saved.');
      } else {
        console.error('Failed to save entry.');
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
    }
  }

  function renderJournalEntries(entries) {
    const journalEntryList = document.getElementById('journalEntryList');

    journalEntryList.innerHTML = '';

    if (entries.length === 0) {
      journalEntryList.textContent = 'No journal entries yet.';
      return;
    }

    entries.forEach((entry) => {
      const entryElement = document.createElement('div');

      entryElement.classList.add('journal-entry');

      entryElement.innerHTML = `
          <h3>${entry.emoji} ${entry.feeling}</h3>
          <p>${entry.quote}</p>
          <p>${entry.note}</p>
          <small>
            ${new Date(entry.date).toLocaleDateString()}
          </small>
        `;

      journalEntryList.append(entryElement);
    });
  }

  async function getJournalEntries() {
    try {
      const res = await fetch('/api/journal');

      if (!res.ok) {
        throw new Error('Failed to fetch journal entries.');
      }

      const entries = await res.json();

      renderJournalEntries(entries);

      return entries;
    } catch (err) {
      console.error('Error loading journal entries:', err);
      return [];
    }
  }

  document
    .getElementById('saveJournalBtn')
    .addEventListener('click', saveJournalEntry);

  document.getElementById('cancelJournalBtn').addEventListener('click', () => {
    document.getElementById('journalDropdown').classList.remove('open');
  });

  return {
    openJournalDropdown,
    getJournalEntries,
  };
}
