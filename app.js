
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
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = '🔥 1000 XP';
    badgesEl.appendChild(badge);
  }
  if (level >= 10) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = '🏆 Niveau 10+';
    badgesEl.appendChild(badge);
  }
  if (tasks.length >= 10) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = '📝 10 tâches';
    badgesEl.appendChild(badge);
  }
}

function render() {
  const taskList = document.getElementById('taskList');
  const xpTotal = document.getElementById('xpTotal');
  const levelEl = document.getElementById('level');
  const xpToNext = document.getElementById('xpToNext');
  const fill = document.getElementById('progressFill');

  taskList.innerHTML = '';
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = task.done;
    box.onchange = () => toggleTask(i, li);

    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => deleteTask(i);

    li.appendChild(box);
    li.append(`${task.name} [+${task.points} XP]`);
    li.appendChild(del);
    taskList.appendChild(li);
  });

  const level = getLevel();
  xpTotal.textContent = xp;
  levelEl.textContent = level;
  xpToNext.textContent = getXpToNextLevel(level);

  const levelXp = levelThresholds[level] || 1;
  const previousXp = levelThresholds.slice(0, level).reduce((a,b) => a+b, 0);
  const progress = Math.min(100, ((xp - previousXp) / levelXp) * 100);
  fill.style.width = `${progress}%`;

  updateBadgesAndGrade(level);
}

function toggleTask(index, element) {
  const task = tasks[index];
  task.done = true;
  xp += task.points;

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

render();


function resetProfile() {
  if (confirm("Voulez-vous vraiment réinitialiser votre profil ?")) {
    tasks = [];
    xp = 0;
    save();
    render();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelector(".stats");
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "🔄 Réinitialiser le profil";
  resetBtn.style.marginTop = "1rem";
  resetBtn.style.backgroundColor = "#f44336";
  resetBtn.style.color = "white";
  resetBtn.style.border = "none";
  resetBtn.style.padding = "0.5rem 1rem";
  resetBtn.style.borderRadius = "6px";
  resetBtn.style.cursor = "pointer";
  resetBtn.onclick = resetProfile;
  stats.appendChild(resetBtn);
});


function resetHistory() {
  if (confirm("Voulez-vous vraiment supprimer l'historique ?")) {
    localStorage.removeItem('history');
    alert("Historique supprimé !");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const resetHistBtn = document.createElement("button");
  resetHistBtn.textContent = "🗑️ Vider l'historique";
  resetHistBtn.style.marginLeft = "1rem";
  resetHistBtn.style.backgroundColor = "#ff9800";
  resetHistBtn.style.color = "white";
  resetHistBtn.style.border = "none";
  resetHistBtn.style.padding = "0.3rem 0.8rem";
  resetHistBtn.style.borderRadius = "6px";
  resetHistBtn.style.cursor = "pointer";
  resetHistBtn.onclick = resetHistory;
  nav.appendChild(resetHistBtn);
});


const categoryEmojis = {
  Sport: "💪",
  Alimentation: "🍎",
  "Healthy Life": "🧘",
  "Good Habit": "📘",
  "Succès": "🚀"
};

function applyFilters(tasks) {
  const catFilter = document.getElementById('filterCategory')?.value;
  const freqFilter = document.getElementById('filterFrequency')?.value;

  return tasks.filter(task => {
    const matchCat = !catFilter || catFilter === "all" || task.category === catFilter;
    const matchFreq = !freqFilter || freqFilter === "all" || task.type === freqFilter;
    return matchCat && matchFreq;
  });
}

function render() {
  const taskList = document.getElementById('taskList');
  const xpTotal = document.getElementById('xpTotal');
  const levelEl = document.getElementById('level');
  const xpToNext = document.getElementById('xpToNext');
  const fill = document.getElementById('progressFill');

  taskList.innerHTML = '';
  const filteredTasks = applyFilters(tasks);

  filteredTasks.forEach((task, i) => {
    const li = document.createElement('li');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = task.done;
    box.onchange = () => toggleTask(i, li);

    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => deleteTask(i);

    const emoji = categoryEmojis[task.category] || '🔸';

    li.appendChild(box);
    li.append(`${emoji} ${task.name} (${task.type}, ${task.category}) [+${task.points} XP]`);
    li.appendChild(del);
    taskList.appendChild(li);
  });

  const level = getLevel();
  xpTotal.textContent = xp;
  levelEl.textContent = level;
  xpToNext.textContent = getXpToNextLevel(level);

  const levelXp = levelThresholds[level] || 1;
  const previousXp = levelThresholds.slice(0, level).reduce((a,b) => a+b, 0);
  const progress = Math.min(100, ((xp - previousXp) / levelXp) * 100);
  fill.style.width = `${progress}%`;

  updateBadgesAndGrade(level);
}

document.addEventListener("DOMContentLoaded", () => {
  // Ajout des filtres
  const left = document.querySelector(".left");
  const filterBar = document.createElement("div");
  filterBar.style.marginBottom = "1rem";

  const catLabel = document.createElement("label");
  catLabel.textContent = "Catégorie : ";
  const catSelect = document.createElement("select");
  catSelect.id = "filterCategory";
  catSelect.innerHTML = `
    <option value="all">Toutes</option>
    <option value="Sport">💪 Sport</option>
    <option value="Alimentation">🍎 Alimentation</option>
    <option value="Healthy Life">🧘 Healthy Life</option>
    <option value="Good Habit">📘 Good Habit</option>
    <option value="Succès">🚀 Succès</option>
  `;
  catSelect.onchange = render;

  const freqLabel = document.createElement("label");
  freqLabel.textContent = "  Périodicité : ";
  const freqSelect = document.createElement("select");
  freqSelect.id = "filterFrequency";
  freqSelect.innerHTML = `
    <option value="all">Toutes</option>
    <option value="daily">Quotidienne</option>
    <option value="weekly">Hebdomadaire</option>
    <option value="3days">Tous les 3 jours</option>
    <option value="one-shot">Ponctuelle</option>
  `;
  freqSelect.onchange = render;

  filterBar.appendChild(catLabel);
  filterBar.appendChild(catSelect);
  filterBar.appendChild(freqLabel);
  filterBar.appendChild(freqSelect);
  left.insertBefore(filterBar, left.querySelector("ul"));
});
