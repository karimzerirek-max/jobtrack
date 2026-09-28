const jobForm = document.getElementById("jobForm");
const jobsContainer = document.getElementById("jobsContainer");

const totalCount = document.getElementById("totalCount");
const appliedCount = document.getElementById("appliedCount");
const interviewCount = document.getElementById("interviewCount");
const offerCount = document.getElementById("offerCount");

let jobs = [];
let editingJobId = null;
let currentFilter = "Todas";

async function loadJobs() {
  try {
    const response = await fetch("/api/jobs");
    jobs = await response.json();

    renderJobs(currentFilter);
    updateStats();
  } catch (error) {
    console.error("Error cargando candidaturas:", error);
  }
}

jobForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const company = document.getElementById("company").value;
  const position = document.getElementById("position").value;
  const status = document.getElementById("status").value;
  const date = document.getElementById("date").value;

  const jobData = {
    company,
    position,
    status,
    date
  };

  try {
    if (editingJobId) {
      await fetch(`/api/jobs/${editingJobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jobData)
      });

      editingJobId = null;

      document.querySelector(
        '#jobForm button[type="submit"]'
      ).textContent = "Guardar candidatura";
    } else {
      await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jobData)
      });
    }

    jobForm.reset();

    await loadJobs();

  } catch (error) {
    console.error("Error guardando candidatura:", error);
  }
});

async function deleteJob(id) {
  try {
    await fetch(`/api/jobs/${id}`, {
      method: "DELETE"
    });

    await loadJobs();

  } catch (error) {
    console.error("Error eliminando candidatura:", error);
  }
}

function editJob(id) {
  const job = jobs.find(job => job.id === id);

  if (!job) {
    return;
  }

  document.getElementById("company").value = job.company;
  document.getElementById("position").value = job.position;
  document.getElementById("status").value = job.status;
  document.getElementById("date").value = job.date;

  editingJobId = id;

  document.querySelector(
    '#jobForm button[type="submit"]'
  ).textContent = "Actualizar candidatura";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function changeStatus(id, newStatus) {
  const job = jobs.find(job => job.id === id);

  if (!job) {
    return;
  }

  const updatedJob = {
    ...job,
    status: newStatus
  };

  try {
    await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedJob)
    });

    await loadJobs();

  } catch (error) {
    console.error("Error cambiando estado:", error);
  }
}

function renderJobs(filter = "Todas") {
  jobsContainer.innerHTML = "";

  currentFilter = filter;

  let filteredJobs = jobs;

  if (filter !== "Todas") {
    filteredJobs = jobs.filter(job => job.status === filter);
  }

  if (filteredJobs.length === 0) {
    jobsContainer.innerHTML = `
      <p class="empty-message">
        No hay candidaturas en esta categoría.
      </p>
    `;
    return;
  }

  filteredJobs.forEach(function (job) {
    const jobCard = document.createElement("div");

    jobCard.classList.add("job-card");

    jobCard.innerHTML = `
      <div class="job-info">
        <h3>${job.position}</h3>
        <p>${job.company}</p>

        <span class="status ${job.status.toLowerCase()}">
          ${job.status}
        </span>
      </div>

      <div class="job-actions">

        <p>
          <strong>Fecha:</strong> ${job.date}
        </p>

        <select onchange="changeStatus(${job.id}, this.value)">

          <option
            value="Aplicada"
            ${job.status === "Aplicada" ? "selected" : ""}
          >
            Aplicada
          </option>

          <option
            value="Entrevista"
            ${job.status === "Entrevista" ? "selected" : ""}
          >
            Entrevista
          </option>

          <option
            value="Oferta"
            ${job.status === "Oferta" ? "selected" : ""}
          >
            Oferta
          </option>

          <option
            value="Rechazada"
            ${job.status === "Rechazada" ? "selected" : ""}
          >
            Rechazada
          </option>

        </select>

        <button
          class="edit-btn"
          onclick="editJob(${job.id})"
        >
          Editar
        </button>

        <button
          class="delete-btn"
          onclick="deleteJob(${job.id})"
        >
          Eliminar
        </button>

      </div>
    `;

    jobsContainer.appendChild(jobCard);
  });
}

function updateStats() {
  totalCount.textContent = jobs.length;

  appliedCount.textContent = jobs.filter(
    job => job.status === "Aplicada"
  ).length;

  interviewCount.textContent = jobs.filter(
    job => job.status === "Entrevista"
  ).length;

  offerCount.textContent = jobs.filter(
    job => job.status === "Oferta"
  ).length;
}

function filterJobs(status) {
  renderJobs(status);
}

loadJobs();