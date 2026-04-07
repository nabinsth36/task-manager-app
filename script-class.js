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
    this.tasks.splice(index, 1);
  }
}
function renderTasks(tasks) {
  taskListUl.innerHTML = ""; // clear previous list

  tasks.forEach((task) => {
    const taskLi = document.createElement("ul");
    taskLi.textContent = task;
    taskListUl.append(taskLi);
  });
}

// Create ONE instance (global state)
const taskManager = new TaskManager();

addBtnEl.addEventListener("click", function () {
  const taskText = taskInputEl.value; // correct timing

  if (taskText.trim() === "") return; // prevent empty task

  // data update
  taskManager.addTask(taskText);

  // UI update

  renderTasks(taskManager.tasks); // render from state
  console.log(taskText);

  taskInputEl.value = ""; // clear input
});
