
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
      // Reset done and push a clone of the task
      const newTask = { ...task, done: false };
      tasks.splice(index, 1); // remove current
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


function updateBadgesAndGrade() {
  const badgesEl = document.getElementById('badges');
  const levelEl = document.getElementById('level');
  const level = getLevel();
  const gradeIndex = Math.floor(level / 10);
  const grade = grades[gradeIndex] || grades[grades.length - 1];

  const gradeP = document.createElement('p');
  gradeP.innerHTML = "<strong>Grade:</strong> " + grade;

  const parent = levelEl.parentElement;
  const oldGrade = parent.querySelector('p.grade');
  if (oldGrade) parent.removeChild(oldGrade);

  gradeP.className = "grade";
  parent.appendChild(gradeP);

  // Exemple de badge simple (par XP)
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

const originalRender = render;
render = function () {
  originalRender();
  updateBadgesAndGrade();
};

render();
