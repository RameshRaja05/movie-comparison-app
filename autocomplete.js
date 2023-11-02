import { debounce } from "./utills.js";

export const createAutocomplete = ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) => {
  //js generated dropdown it decreases coupling
  root.innerHTML = `
<label><b>Search</b></label>
<input type="text" name="searchInput" class="input"/>
<div class="dropdown">
        <div class="dropdown-menu">
          <div class="dropdown-content results">
          </div>
        </div>
      </div>
`;
  const searchInput = root.querySelector("input[name=searchInput]");
  const dropdown = root.querySelector(".dropdown");
  const resultsContainer = root.querySelector(".results");

  const renderResults = (items) => {
    if (items.length === 0) {
      dropdown.classList.remove("is-active");
      return;
    }
    resultsContainer.innerHTML = "";
    dropdown.classList.add("is-active");
    for (let item of items) {
      const option = document.createElement("a");
      option.classList.add("dropdown-item");
      option.innerHTML = renderOption(item);
      option.addEventListener("click", () => {
        dropdown.classList.remove("is-active");
        searchInput.value = inputValue(item);
        onOptionSelect(item);
      });
      resultsContainer.appendChild(option);
    }
  };

  const onInput = async (e) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      dropdown.classList.remove("is-active");
      return;
    }
    const items = await fetchData(searchTerm);
    renderResults(items);
  };

  searchInput.addEventListener("input", debounce(onInput));

  //add an event listener for closing a dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) {
      dropdown.classList.remove("is-active");
    }
  });
};
