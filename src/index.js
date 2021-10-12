import "./autocomplete-select.css";

function autocomplete(params) {
  
  const createInput = function(placeholder) {
    const inputEl = document.createElement("INPUT");
    inputEl.type = "text";
    inputEl.classList.add("autocomplete-input");
    if (placeholder) inputEl.placeholder = placeholder;
    if (initialValue) inputEl.value = initialValue;
    container.appendChild(inputEl);
    return inputEl
  }

  const container = params.container;
  const onInput = params.onInput;
  const formatMatch = params.formatMatch;
  const clearBtnEnabled = params.clearBtn;
  const onClear = params.onClear;
  const onSelect = params.onSelect;
  const initialValue = params.initialValue;
  const input = createInput(params.placeholder);

  let selectedText = "";
  let matches = [];
  let matchNodes = [];
  let activeMatchId = -1;



  const getArrowIndex = function(key) {
    if (key == "ArrowDown") {
      return ((activeMatchId + 1) % matches.length)
    } else if (key === "ArrowUp") {
      if (activeMatchId === -1) {
        return (matches.length - 1)
      } else {
        return ((activeMatchId + matches.length - 1) % matches.length)
      }
    }
  }

  const selectMatch = function() {
    selectedText = matchNodes[activeMatchId].innerText;
    input.value = selectedText;
    onSelect(matches[activeMatchId]);
    input.blur();
    destroyResultsPanel();
  }

  const clearInput = function(e) {
    input.value = "";
    e.target.remove();
    destroyResultsPanel();
    matches = [];
    matchNodes = [];
    selectedText = "";
    onClear();
  }

  const markActive = function(matchEl) {
    if (!matchEl) return;
    // Mark previous active match (if it exists) as inactive
    if (matchNodes[activeMatchId]) {
      markInactive(matchNodes[activeMatchId]);
    }
    // Set new activeMatchId
    activeMatchId = parseInt(matchEl.dataset.matchIndex);
    matchEl.classList.add("active")
  }

  const markInactive = function(matchEl) {
    matchEl.classList.remove("active")
  }

  const createMatchNodes = function(matches) {
    return matches.map((match, index) => {
      const item = document.createElement("LI");
      item.dataset.matchIndex = index;
      item.addEventListener("mouseenter", e => markActive(e.target));
      item.addEventListener("mousedown", e => {
        // Select match if main mouse button is pressed
        if (e.button === 0) {
          selectMatch();
        }
      })
      typeof match === "Node" ? item.appendChild(match) : item.textContent = match ;
      return item;
    })
  }

  const displayMatches = function(matchesList) {
    //Store the externally derived matchesList in the matches variable
    matches = matchesList
    //If there are no matches for the query, remove the results panel
    if (matches.length === 0) return destroyResultsPanel();
    matchNodes = createMatchNodes(matches.map(formatMatch))
    const list = matchNodes.reduce((listParent, matchNode) => {
      listParent.appendChild(matchNode)
      return listParent
    }, document.createElement("UL"))
    const results = getOrInsertResultsPanel();
    results.textContent = "";
    results.appendChild(list);
  }

  const getResultsPanel = function() {
    return container.getElementsByClassName("autocomplete-results")[0];
  }

  const getOrInsertResultsPanel = function() {
    //If results panel exists, return it. Otherwise, create/insert it.
    let resultsPanel = getResultsPanel();
    if (resultsPanel) {
      return resultsPanel
    } else {
      resultsPanel = createResultsPanel();
      input.insertAdjacentElement("afterend", resultsPanel)
      return resultsPanel
    }
  }

  const createResultsPanel = function() {
    const resultsPanel = document.createElement("DIV")
    resultsPanel.classList.add("autocomplete-results")
    return resultsPanel
  }

  const destroyResultsPanel = function() {
    activeMatchId = -1;
    const resultsPanel = getResultsPanel()
    if (resultsPanel) resultsPanel.remove()
  }

  const addClearBtn = function() {
    const btn = document.createElement("BUTTON");
    btn.type = "button";
    btn.classList.add("autocomplete-clear");
    btn.textContent = "X";
    btn.addEventListener("click", clearInput)
    input.insertAdjacentElement("afterend", btn)
  }

  const ensureClearBtn = function() {
    //If there is text to clear and no clear button present, add it
    if ((input.value !== "") && !container.getElementsByClassName("autocomplete-clear")[0]) {
      addClearBtn();
    }
  }

  const destroyClearBtn = function() {
    const btn = container.getElementsByClassName("autocomplete-clear")[0];
    if (btn) btn.remove();
  }

  const removeExtrasIfEmpty = function() {
    if (input.value === "") {
      destroyResultsPanel();
      destroyClearBtn();
    }
  }

  input.addEventListener("blur", () => {
    //Revert to previously selected text only if deleteBtn is enabled
    if (selectedText && clearBtnEnabled) {
      input.value = selectedText
    }
    destroyResultsPanel();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      selectMatch();
    }
  });

  const handleInput = function(e) {
    onInput(e.target.value, displayMatches);
    if (clearBtnEnabled) ensureClearBtn();
  }

  input.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "ArrowDown" :
        markActive(matchNodes[getArrowIndex("ArrowDown")]);
        break
      case "ArrowUp" :
        markActive(matchNodes[getArrowIndex("ArrowUp")]);
        break
      case "Enter" :
      case "Backspace" :
        removeExtrasIfEmpty(); 
        handleInput(e);
        break
      default:
        handleInput(e);
    }
  })
}

export default autocomplete;
