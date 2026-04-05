const addBtnEl = document.getElementById("addBtn");
const taskInputEl = document.getElementById("taskInput");
const taskListUl = document.getElementById("taskList");

function addTask() {
  const taskText = taskInputEl.value; // correct timing

  if (taskText.trim() === "") return; // prevent empty task

  const taskLi = document.createElement("li");

  taskLi.textContent = taskText;

  taskListUl.append(taskLi);

  taskInputEl.value = ""; // clear input
}

addBtnEl.addEventListener("click", function (e) {
  // e.preventDefault();

  addTask();
});
