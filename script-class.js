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

  updateTask(index, newText) {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks[index].text = newText;
      this.saveToLocalStorage();
    }
  }
}

let currentFilter = "all";

function renderTasks(tasks) {
  taskListUl.innerHTML = ""; // clear previous list

  if (tasks.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "No tasks yet. Add one!";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.color = "#888";

    taskListUl.append(emptyMsg);
  }

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

      toggleBtn.type = "checkbox";
      toggleBtn.checked = completed; // Set checkbox state based on task data

      taskSpan.textContent = text;

      // Add a style if the task is finished
      if (completed) {
        taskSpan.style.textDecoration = "line-through";
        taskSpan.style.opacity = "0.5";
      }

      removeBtn.textContent = "❌";

      // Append in a logical order (Checkbox -> Text -> Delete)
      taskLi.append(toggleBtn, taskSpan, removeBtn);
      taskListUl.append(taskLi);
    });

  const counterEl = document.getElementById("taskCounter");

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  counterEl.textContent = `Total: ${total} | Completed: ${completed} | Pending: ${pending}`;
  taskListUl.after(taskCounter);
}

function setActiveFilter(buttonId) {
  document.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(buttonId).classList.add("active");
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

  if (e.target.matches("span")) {
    // edit task in data structure
    const span = e.target;
    const li = span.closest("li");
    const index = Number(li.dataset.index);

    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;

    li.replaceChild(input, span);
    input.focus();

    // Save on Enter
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const newText = input.value.trim();

        if (newText !== "") {
          taskManager.updateTask(index, newText);
        }

        renderTasks(taskManager.tasks);
      }
    });

    // Save on blur
    input.addEventListener("blur", function () {
      const newText = input.value.trim();

      if (newText !== "") {
        taskManager.updateTask(index, newText);
      }

      renderTasks(taskManager.tasks);
    });
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
    taskInputEl.focus();

    isAdding = false;
  });
});

// Enter key support

taskInputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addBtnEl.click();
  }
});

// Filter event listeners

document.getElementById("filterAll").addEventListener("click", () => {
  currentFilter = "all";
  setActiveFilter("filterAll");
  renderTasks(taskManager.tasks);
});

document.getElementById("filterCompleted").addEventListener("click", () => {
  currentFilter = "completed";
  setActiveFilter("filterCompleted");
  renderTasks(taskManager.tasks);
});

document.getElementById("filterPending").addEventListener("click", () => {
  currentFilter = "pending";
  setActiveFilter("filterPending");
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
