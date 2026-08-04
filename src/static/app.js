document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Modal elements (already in index.html)
  const modal = document.getElementById('confirm-modal');
  const modalText = document.getElementById('modal-text');
  const modalConfirm = document.getElementById('modal-confirm');
  const modalCancel = document.getElementById('modal-cancel');

  // Confirm button handler reads modal dataset when clicked
  modalConfirm.addEventListener('click', async () => {
    const activityName = modal.dataset.activity;
    const participantEmail = modal.dataset.email;
    if (!activityName || !participantEmail) return;

    modalConfirm.disabled = true;
    try {
      const resp = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(participantEmail)}`,
        { method: 'DELETE' }
      );
      const resJson = await resp.json();
      if (resp.ok) {
        messageDiv.textContent = resJson.message || 'Participante removido';
        messageDiv.className = 'success';
        messageDiv.classList.remove('hidden');
        // refresh activities after a short delay
        setTimeout(() => { fetchActivities(); }, 200);
      } else {
        messageDiv.textContent = resJson.detail || 'Erro ao remover participante';
        messageDiv.className = 'error';
        messageDiv.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error removing participant:', err);
      messageDiv.textContent = 'Erro ao remover participante';
      messageDiv.className = 'error';
      messageDiv.classList.remove('hidden');
    } finally {
      modalConfirm.disabled = false;
      modal.classList.add('hidden');
      delete modal.dataset.activity;
      delete modal.dataset.email;
      setTimeout(() => messageDiv.classList.add('hidden'), 4000);
    }
  });

  modalCancel.addEventListener('click', () => {
    modal.classList.add('hidden');
    delete modal.dataset.activity;
    delete modal.dataset.email;
  });

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      // reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Selecione uma atividade --</option>';
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Horário:</strong> ${details.schedule}</p>
          <p><strong>Vagas:</strong> ${spotsLeft} restantes</p>
        `;

        // Participants container built with DOM methods so we can attach handlers
        const participantsDiv = document.createElement('div');
        participantsDiv.className = 'participants';

        const titleP = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'Participantes';
        titleP.appendChild(strong);
        participantsDiv.appendChild(titleP);

        if (details.participants && details.participants.length > 0) {
          const ul = document.createElement('ul');
          ul.className = 'participants-list';

          details.participants.forEach(p => {
            const li = document.createElement('li');
            li.className = 'participant-item';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = p;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'participant-remove';
            // SVG trash icon + visible label for clarity (no tooltip)
            removeBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 6h18" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 11v6" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11v6" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`;

            // add visible text label next to the icon
            const labelSpan = document.createElement('span');
            labelSpan.className = 'remove-text';
            removeBtn.appendChild(labelSpan);

            removeBtn.addEventListener('click', () => {
              // open confirmation modal
              modal.dataset.activity = name;
              modal.dataset.email = p;
              modalText.textContent = `Remover ${p} de ${name}?`;
              modal.classList.remove('hidden');
            });

            li.appendChild(nameSpan);
            li.appendChild(removeBtn);
            ul.appendChild(li);
          });

          participantsDiv.appendChild(ul);
        } else {
          const noP = document.createElement('p');
          noP.className = 'no-participants';
          noP.innerHTML = '<em>Nenhum participante ainda</em>';
          participantsDiv.appendChild(noP);
        }

        activityCard.appendChild(participantsDiv);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
