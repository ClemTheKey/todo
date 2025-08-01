
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let xp = parseInt(localStorage.getItem('xp') || '0');

const levelThresholds = [
  100, 125, 144, 158, 170, 181, 191, 200, 208, 215, 222, 228, 235, 241, 246,
  251, 257, 262, 266, 271, 275, 280, 284, 288, 292, 296, 300, 303, 307, 310,
  314, 317, 320, 323, 327, 330, 333, 336, 339, 341, 344, 347, 350, 353, 355,
  358, 360, 363, 365, 368, 370, 373, 375, 377, 380, 382, 384, 387, 389, 391,
  393, 395, 397, 400, 402, 404, 406, 408, 410, 412, 414, 416, 417, 419, 421,
  423, 425, 427, 429, 430, 432, 434, 436, 437, 439, 441, 443, 444, 446, 448,
  449, 451, 453, 454, 456, 457, 459, 461, 462, 463
];

const grades = [
  "Bouli Bouli", "Loukoum", "Pas mauvais", "Bien mais pas top", "Ah! On y vient",
  "Poulet", "En cannes", "Patron du game", "Monte Cristo", "Meilleure version de moi même"
];

const categoryEmojis = {
  Sport: "💪",
  Alimentation: "🍎",
  "Healthy Life": "🧘",
  "Good Habit": "📘",
  "Succès": "🚀"
};

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('xp', xp.toString());
}

function getLevel() {
  let sum = 0;
  for (let i = 0; i < levelThresholds.length; i++) {
    sum += levelThresholds[i];
    if (xp < sum) return i;
  }
  return 99;
}

function getXpToNextLevel(currentLevel) {
  if (currentLevel >= levelThresholds.length) return 0;
  let accumulated = levelThresholds.slice(0, currentLevel).reduce((a,b) => a+b, 0);
  return levelThresholds[currentLevel] - (xp - accumulated);
}

function updateBadgesAndGrade(level) {
  const badgesEl = document.getElementById('badges');
  const gradeIndex = Math.floor(level / 10);
  const grade = grades[gradeIndex] || grades[grades.length - 1];

  const profileEl = document.querySelector('.stats');
  let gradeEl = document.getElementById('gradeText');
  if (!gradeEl) {
    gradeEl = document.createElement('p');
    gradeEl.id = 'gradeText';
    profileEl.appendChild(gradeEl);
  }
  gradeEl.innerHTML = `<strong>Grade :</strong> ${grade}`;

  badgesEl.innerHTML = '';
  if (xp >= 1000) {
    badgesEl.innerHTML += `<span class="badge">🔥 1000 XP</span>`;
  }
  if (level >= 10) {
    badgesEl.innerHTML += `<span class="badge">🏆 Niveau 10+</span>`;
  }
  if (tasks.length >= 10) {
    badgesEl.innerHTML += `<span class="badge">📝 10 tâches</span>`;
  }
}




function render() {
  const taskList = document.getElementById('taskList');
  const xpTotal = document.getElementById('xpTotal');
  const levelEl = document.getElementById('level');
  const xpToNext = document.getElementById('xpToNext');
  const fill = document.getElementById('progressFill');

  taskList.innerHTML = '';
  const groupBy = document.getElementById("groupBy")?.value || "category";

  let grouped = {};
  tasks.forEach((task, i) => {
    const key = task[groupBy] || "Autre";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ task, index: i });
  });

  Object.entries(grouped).forEach(([group, entries]) => {
    const header = document.createElement("h3");
    header.textContent = group;
    taskList.appendChild(header);

    entries.forEach(({ task, index }) => {
      const li = document.createElement("li");
      li.dataset.type = task.type;
      li.dataset.category = task.category;

      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = task.done;
      box.onchange = () => toggleTask(index, li);

      const del = document.createElement("button");
      del.textContent = "X";
      del.onclick = () => deleteTask(index);

      const emoji = categoryEmojis[task.category] || "🔸";
      li.appendChild(box);
      li.append(`${emoji} ${task.name} (${task.type}, ${task.category}) [+${task.points} XP]`);
      li.appendChild(del);
      taskList.appendChild(li);
    });
  });

  const level = getLevel();
  xpTotal.textContent = xp;
  levelEl.textContent = level;
  xpToNext.textContent = getXpToNextLevel(level);
  const levelXp = levelThresholds[level] || 1;
  const previousXp = levelThresholds.slice(0, level).reduce((a, b) => a + b, 0);
  fill.style.width = Math.min(100, ((xp - previousXp) / levelXp) * 100) + "%";

  updateBadgesAndGrade(level);
}



function toggleTask(index, element) {
  const task = tasks[index];
  task.done = true;
  xp += task.points;
  saveToHistory(task);
  element.classList.add('fade-out');

  setTimeout(() => {
    if (task.type === 'one-shot') {
      tasks.splice(index, 1);
    } else {
      const newTask = { ...task, done: false };
      tasks.splice(index, 1);
      setTimeout(() => {
        tasks.push(newTask);
        save();
        render();
      }, 2000);
      return;
    }
    save();
    render();
  }, 600);
}

function deleteTask(index) {
  tasks.splice(index, 1);
  save();
  render();
}

function resetProfile() {
  if (confirm("Réinitialiser votre profil ?")) {
    xp = 0;
    save();
    render();
  }
}

function resetHistory() {
  if (confirm("Supprimer l'historique ?")) {
    localStorage.removeItem('history');
    alert("Historique supprimé !");
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const left = document.querySelector(".left");
  const groupDiv = document.createElement("div");
  groupDiv.style.marginBottom = "1rem";
  groupDiv.innerHTML = `
    <label>Regrouper par :</label>
    <select id="groupBy">
      <option value="category">Catégorie</option>
      <option value="type">Périodicité</option>
    </select>
  `;
  groupDiv.querySelector("select").onchange = () => render();
  left.insertBefore(groupDiv, left.querySelector("ul"));

  const stats = document.querySelector(".stats");
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "🔄 Réinitialiser le profil";
  resetBtn.onclick = resetProfile;
  resetBtn.style.cssText = "margin-top:1rem;background:#f44336;color:#fff;border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer";
  stats.appendChild(resetBtn);

  const nav = document.querySelector("nav");
  const histBtn = document.createElement("button");
  histBtn.textContent = "🗑️ Vider l'historique";
  histBtn.onclick = resetHistory;
  histBtn.style.cssText = "margin-left:1rem;background:#ff9800;color:white;border:none;padding:0.3rem 0.8rem;border-radius:6px;cursor:pointer";
  nav.appendChild(histBtn);

  const left = document.querySelector(".left");
  const filterBar = document.createElement("div");
  filterBar.style.marginBottom = "1rem";

  filterBar.innerHTML = `    <label>Regrouper par :       <select id="groupBy">        <option value="category">Catégorie</option>        <option value="type">Périodicité</option>      </select>    </label><br><br>
    <label>Catégorie : 
      <select id="filterCategory">
        <option value="all">Toutes</option>
        <option value="Sport">💪 Sport</option>
        <option value="Alimentation">🍎 Alimentation</option>
        <option value="Healthy Life">🧘 Healthy Life</option>
        <option value="Good Habit">📘 Good Habit</option>
        <option value="Succès">🚀 Succès</option>
      </select>
    </label>
    <label style="margin-left:1rem;">Périodicité : 
      <select id="filterFrequency">
        <option value="all">Toutes</option>
        <option value="daily">Quotidienne</option>
        <option value="weekly">Hebdomadaire</option>
        <option value="3days">Tous les 3 jours</option>
        <option value="one-shot">Ponctuelle</option>
      </select>
    </label>
  `;

  filterBar.querySelectorAll('select').forEach(s => s.onchange = render);
  left.insertBefore(filterBar, left.querySelector("ul"));

  render();
});


function saveFilterPreferences() {
  localStorage.setItem('filterCategory', document.getElementById('filterCategory')?.value);
  localStorage.setItem('filterFrequency', document.getElementById('filterFrequency')?.value);
  localStorage.setItem('groupBy', document.getElementById('groupBy')?.value);
}

function loadFilterPreferences() {
  if (document.getElementById('filterCategory')) {
    document.getElementById('filterCategory').value = localStorage.getItem('filterCategory') || 'all';
    document.getElementById('filterFrequency').value = localStorage.getItem('filterFrequency') || 'all';
    document.getElementById('groupBy').value = localStorage.getItem('groupBy') || 'category';
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const left = document.querySelector(".left");
  const groupDiv = document.createElement("div");
  groupDiv.style.marginBottom = "1rem";
  groupDiv.innerHTML = `
    <label>Regrouper par :</label>
    <select id="groupBy">
      <option value="category">Catégorie</option>
      <option value="type">Périodicité</option>
    </select>
  `;
  groupDiv.querySelector("select").onchange = () => render();
  left.insertBefore(groupDiv, left.querySelector("ul"));

  loadFilterPreferences();
  render();
});

document.addEventListener("change", (e) => {
  if (["filterCategory", "filterFrequency", "groupBy"].includes(e.target.id)) {
    saveFilterPreferences();
    render();
  }
});

// Remplacer dans render() le bloc qui crée les titres de groupe
// pour ajouter des couleurs et un bouton de pliage/dépliage



function saveToHistory(task) {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const entry = {
    name: task.name,
    category: task.category,
    type: task.type,
    points: task.points,
    date: new Date().toLocaleString()
  };
  history.push(entry);
  localStorage.setItem('history', JSON.stringify(history));
}


document.addEventListener("DOMContentLoaded", () => {

  const left = document.querySelector(".left");
  const groupDiv = document.createElement("div");
  groupDiv.style.marginBottom = "1rem";
  groupDiv.innerHTML = `
    <label>Regrouper par :</label>
    <select id="groupBy">
      <option value="category">Catégorie</option>
      <option value="type">Périodicité</option>
    </select>
  `;
  groupDiv.querySelector("select").onchange = () => render();
  left.insertBefore(groupDiv, left.querySelector("ul"));

  const hideFilters = () => {
    ['filterCategory', 'filterFrequency', 'filterPeriod', 'typeFilter', 'groupBy'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentElement) el.parentElement.style.display = 'none';
    });
  };
  hideFilters();
});
