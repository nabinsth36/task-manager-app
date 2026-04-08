const addBtnEl = document.getElementById("addBtn");
const taskInputEl = document.getElementById("taskInput");
const taskListUl = document.getElementById("taskList");

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  addTask(text) {
    this.tasks.push(text);
  }

  removeTask(index) {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks.splice(index, 1);
    }
  }

  toggleTask(index) {
    this.tasks[index].completed = !this.tasks[index].completed;
  }
}
function renderTasks(tasks) {
  taskListUl.innerHTML = ""; // clear previous list

  tasks.forEach((task, index) => {
    const taskLi = document.createElement("li");
    const taskSpan = document.createElement("span");
    const removeBtn = document.createElement("button");

    taskSpan.textContent = task;
    removeBtn.textContent = "❌";

    taskLi.append(taskSpan, removeBtn);
    taskListUl.append(taskLi);

    // remove task from data structure
    removeBtn.addEventListener("click", function () {
      taskManager.removeTask(index);
      renderTasks(taskManager.tasks); // re-render
    });

    // toggle task in data structure
  });
}

// Create ONE instance (global state)
const taskManager = new TaskManager();

addBtnEl.addEventListener("click", function () {
  const taskText = taskInputEl.value; // correct timing

  if (taskText.trim() === "") return; // prevent empty task

  // data update
  taskManager.addTask({ text: taskText, completed: false });

  // UI update

  renderTasks(taskManager.tasks); // render from state
  console.log(taskText);

  taskInputEl.value = ""; // clear input
});
