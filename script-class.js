const addBtnEl = document.getElementById("addBtn");

const taskInputEl = document.getElementById("taskInput");
const taskListUl = document.getElementById("taskList");

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  addTask(text, callback) {
    setTimeout(() => {
      // 1. Validation error
      if (!text || text.trim() === "") {
        return callback(null, "Task cannot be empty");
      }

      // 2. Simulate random server error
      else if (Math.random() < 0.3) {
        callback(null, "Database connection failed");
      } else {
        // 3. Success:
        this.tasks.push({ text, completed: false });
        this.saveToLocalStorage(); // save
        callback(this.tasks, null); // notify UI
      }
    }, 500);
  }

  removeTask(index) {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks.splice(index, 1);
      this.saveToLocalStorage(); // save
    }
  }

  toggleTask(index) {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks[index].completed = !this.tasks[index].completed;
      this.saveToLocalStorage(); // save
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("tasks");
      this.tasks = data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Invalid localStorage data");
      this.tasks = [];
      showError("Failed to load saved tasks");
    }
  }
}

let currentFilter = "all";

function renderTasks(tasks) {
  taskListUl.innerHTML = ""; // clear previous list

  tasks
    .map((task, index) => ({ ...task, originalIndex: index }))
    .filter((task) => {
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
      return true;
    })
    .forEach(({ text, completed, originalIndex }) => {
      const taskLi = document.createElement("li");
      taskLi.dataset.index = originalIndex; // key fix

      const taskSpan = document.createElement("span");
      const removeBtn = document.createElement("button");
      const toggleBtn = document.createElement("input");

      // taskLi.dataset.index = index; // key fix

      toggleBtn.type = "checkbox";
      toggleBtn.checked = completed; // Set checkbox state based on task data

      taskSpan.textContent = text;

      // Add a style if the task is finished
      if (completed) taskSpan.style.textDecoration = "line-through";

      removeBtn.textContent = "❌";

      // Append in a logical order (Checkbox -> Text -> Delete)
      taskLi.append(toggleBtn, taskSpan, removeBtn);
      taskListUl.append(taskLi);
    });
}

// Use ONE event listener (Outside) on <ul>
taskListUl.addEventListener("click", function (e) {
  const li = e.target.closest("li");
  if (!li) return;

  const index = Number(li.dataset.index);

  if (e.target.matches("button")) {
    // remove task from data structure
    taskManager.removeTask(index);
    renderTasks(taskManager.tasks); // re-render
  }

  if (e.target.matches('input[type="checkbox"]')) {
    // toggle task in data structure
    taskManager.toggleTask(index);
    renderTasks(taskManager.tasks); // re-render
  }
});

// Create ONE instance (global state)
const taskManager = new TaskManager();
taskManager.loadFromLocalStorage();
renderTasks(taskManager.tasks);

let isAdding = false; // guard

addBtnEl.addEventListener("click", function () {
  if (isAdding) return; // prevent duplicate

  const taskText = taskInputEl.value; // correct timing

  if (taskText.trim() === "") return; // prevent empty task

  isAdding = true;

  // Optional: show loading
  addBtnEl.textContent = "Adding...";
  addBtnEl.disabled = true;

  // data update
  taskManager.addTask(taskText, function (tasks, error) {
    if (error) {
      showError(error); // simple UI for now

      addBtnEl.textContent = "Add";
      addBtnEl.disabled = false;
      isAdding = false;

      return;
    }

    // UI update
    renderTasks(tasks); // render from state

    addBtnEl.textContent = "Add"; // restore UI
    addBtnEl.disabled = false;

    taskInputEl.value = ""; // clear input AFTER success

    isAdding = false;
  });
});

// Filter event listeners

document.getElementById("filterAll").addEventListener("click", () => {
  currentFilter = "all";
  renderTasks(taskManager.tasks);
});

document.getElementById("filterCompleted").addEventListener("click", () => {
  currentFilter = "completed";
  renderTasks(taskManager.tasks);
});

document.getElementById("filterPending").addEventListener("click", () => {
  currentFilter = "pending";
  renderTasks(taskManager.tasks);
});

const errorBox = document.getElementById("errorBox");

let errorTimeout;

function showError(message) {
  clearTimeout(errorTimeout);

  errorBox.textContent = message;

  errorTimeout = setTimeout(() => {
    errorBox.textContent = "";
  }, 2000);
}
