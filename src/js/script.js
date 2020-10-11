const wanderList = document.getElementById("wanderList");
let listOfTravels = document.getElementById("listOfTravels");
const noStoriesPrompt = document.getElementById("noStoriesPrompt");
const wanderForm = document.forms.wanderForm;
const inputNames = ["What", "Why", "Where", "Link"];
const inputs = {};
const footerLogo = document.getElementById("footerLogo");
const deleteButtonRow = document.getElementById("deleteButtonRow");
const deleteButton = document.getElementById("deleteButton");

// Hide on load
wanderList.hidden = true;
deleteButtonRow.hidden = true;

for (let name of inputNames) {
  inputs[name.toLowerCase()] = wanderForm[`input${name}`];
}

let currentlySelectedListItem;
let multipleSelectedItems = new Set();

const selectListItem = (e) => {
  e.stopPropagation();

  currentlySelectedListItem = e.currentTarget.closest("#travelItem");
  multipleSelectedItems.add(currentlySelectedListItem);

  currentlySelectedListItem.classList.toggle("active");

  // https://stackoverflow.com/questions/37566597/why-doesnt-includes-work-with-classlist
  if (
    [...multipleSelectedItems].some((item) => item.classList.contains("active"))
  ) {
    deleteButtonRow.hidden = false;
  } else {
    deleteButtonRow.hidden = true;
  }

  if (!e.currentTarget.checked) {
    currentlySelectedListItem = null;
    multipleSelectedItems.delete(currentlySelectedListItem);
  }
};

const deleteListItem = (e) => {
  // remove item from local storage
  const removeFromLocalStorage = (item) => {
    const id = item.dataset.uid;
    localStorage.removeItem(id);
  };

  // If multiple items are selected
  if (multipleSelectedItems.size > 1) {
    for (let item of multipleSelectedItems) {
      item.parentNode.removeChild(item);
      removeFromLocalStorage(item);
    }
    multipleSelectedItems.clear();
  }
  // if only one item is selected
  else {
    currentlySelectedListItem.parentNode.removeChild(currentlySelectedListItem);
    multipleSelectedItems.delete(currentlySelectedListItem);
    removeFromLocalStorage(currentlySelectedListItem);
    currentlySelectedListItem = null;
  }

  if (!document.querySelectorAll("#travelItem").length) {
    noStoriesPrompt.hidden = false;
  }

  deleteButtonRow.hidden = true;
};

const editItemInLocalStorage = (item, key, value) => {
  const uid = item.dataset.uid;
  let existing = JSON.parse(localStorage.getItem(uid));
  existing[key] = value;
  localStorage.setItem(`${uid}`, JSON.stringify(existing));
};

const handleEdit = (e) => {
  let userInput;

  // Prevent other inputs from being interacted with
  // When the user already clicked on one
  const controlOtherInputs = (type) => {
    [...document.querySelectorAll(".editable")]
      .filter((el) => el !== e.currentTarget)
      .forEach((el) => {
        type === "add"
          ? el.addEventListener("click", handleEdit)
          : el.removeEventListener("click", handleEdit);
      });
  };

  controlOtherInputs("remove");

  const topParent = e.currentTarget.closest("#travelItem");
  const directParent = e.currentTarget.parentNode;
  const originalItem = e.currentTarget.cloneNode(true);

  // Build the input element
  const userEditInput = document.createElement("input");
  userEditInput.type = "text";
  userEditInput.placeholder = `${e.currentTarget.innerText}`;
  userEditInput.setAttribute("class", "userEdit");

  // Replace the target item with the input
  directParent.replaceChild(userEditInput, e.currentTarget);
  userEditInput.focus();

  userEditInput.addEventListener("keyup", (e) => {
    userInput = e.target.value;
    if (e.key === "Enter") {
      originalItem.innerHTML = userInput;
      // Replace Child (new -> old)
      // directParent.replaceChild(originalItem, userEditInput);

      // Other way: replaceWith
      userEditInput.replaceWith(originalItem);
      controlOtherInputs("add");

      editItemInLocalStorage(topParent, originalItem.dataset.target, userInput);
    }
  });
};

const addListItem = (e, previousData) => {
  if (!previousData) e.preventDefault();
  // Input values or values from the local storage
  console.log(inputs["what"].value);
  const what = inputs["what"].value || previousData.what;
  const why = inputs["why"].value || previousData.why;
  const where = inputs["where"].value || previousData.where;
  const timeAdded = `${new Date().getDate()}/${
    new Date().getMonth() + 1
  }/${new Date().getFullYear()}`;

  if (!what.length || !why.length || !where.length) {
    return alert("You need to enter the required information!");
  }

  // Link input or default
  const link =
    inputs["link"].value || `http://www.google.com/search?q=${where}`;

  // Build a "unique" id for the list item
  const uid = previousData
    ? previousData.uid
    : `wanderlist${document.querySelectorAll("#travelItem").length + 1}`;

  // Template
  const listItemTemplate = `
  <div id="travelItem" class="list-group-item list-group-item-action pointer" data-uid=${uid}>
  <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1 editable" data-target="what">${what}</h5>
    <small>${timeAdded}</small>
  </div>
  <p class="mb-1 editable" data-target="why">
    ${why}
  </p>
  <div class="container-link-checkbox">
    <small class="pr-2"><a href=${link} target="_blank" class="custom-link pointer">${where}</a></small>
    <input type="checkbox" class="mt-1" aria-label="List item selector checkbox">
  <div>
  </div>
  `;

  // Add item to the end of the list

  // innerHTML += method (only at the botton of the list)
  // listOfTravels.innerHTML += listItemTemplate;

  // insertAdjacentHTML method (can be on top + best practice)
  listOfTravels.insertAdjacentHTML("afterbegin", listItemTemplate);
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML

  // Using insertAdjacentHTML is considered best practice; see:
  // https://stackoverflow.com/questions/11515383/why-is-element-innerhtml-bad-code

  // Add item into the local storage.
  // Object has to be stringified (local storage only accept strings):
  if (!previousData) {
    localStorage.setItem(
      uid,
      JSON.stringify({
        what,
        why,
        where,
        timeAdded
      })
    );
  }

  wanderList.hidden = false;
  noStoriesPrompt.hidden = true;

  // Clear the form
  for (let key in inputs) {
    inputs[key].value = "";
  }

  // Attach event listener to the sub-items of the newly inserted list item
  for (let listItem of listOfTravels.children) {
    listItem
      .querySelector("input[type='checkbox']")
      .addEventListener("click", selectListItem);
    listItem.querySelector("h5").addEventListener("click", handleEdit);
    listItem.querySelector("p").addEventListener("click", handleEdit);
  }
};

const check = () => {
  // something to check
};

footerLogo.onclick = check;

deleteButton.addEventListener("click", deleteListItem);
wanderForm.addEventListener("submit", addListItem);

const init = () => {
  // Check previously stored local storage items
  for (let key in localStorage) {
    if (key.includes("wanderlist")) {
      addListItem(null, { uid: key, ...JSON.parse(localStorage[key]) });
    }
  }
};

init();
