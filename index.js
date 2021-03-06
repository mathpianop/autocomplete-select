function autocomplete(params) {
  
  const createInput = function(placeholder) {
    //Short-circuit if input element already exists
    if (params.container.querySelector(".autocomplete-input")) {
      return
    } 
    const inputEl = document.createElement("INPUT");
    inputEl.type = "text";
    inputEl.classList.add("autocomplete-input");
    inputEl.autocomplete = "off";
    if (params.placeholder) inputEl.placeholder = placeholder;
    if (params.initialValue) inputEl.value = initialValue;
    if (params.name) inputEl.name = params.name
    container.appendChild(inputEl);
    return inputEl
  }

  const getOrCreateInput = function() {
    const existingInput = params.container.querySelector(".autocomplete-input");
    return (existingInput ? existingInput : createInput(params.placeholder));
  }

  const container = params.container;
  const onInput = params.onInput;
  const formatMatch = params.formatMatch;
  const clearBtnEnabled = params.clearBtn;
  const onClear = params.onClear;
  const onSelect = params.onSelect;
  const initialValue = params.initialValue;
  const debug = params.debug
  const input = getOrCreateInput();

  let selectedText = ( initialValue || "" );
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
    if (matchNodes[activeMatchId]) {
      selectedText = matchNodes[activeMatchId].innerText;
    }
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

  const suggestMatches = function(matchesList) {
    //Store the externally derived matchesList in the matches variable
    matches = matchesList
    //If there are no matches for the query, remove the results panel
    if (matches.length === 0) return destroyResultsPanel();
    //Format the matches if a formatMatch function is provided
    const formattedMatches = (formatMatch ? matches.map(formatMatch) : matches)
    matchNodes = createMatchNodes(formattedMatches)
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
    if (!debug) destroyResultsPanel();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      selectMatch();
    }
  });

  const handleInput = function(e) {
    onInput(e.target.value, suggestMatches);
    if (clearBtnEnabled) ensureClearBtn();
    //If user has manually cleared, run onClear callback
    if (e.key === "Backspace" && input.value === "") onClear();
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

  if (clearBtnEnabled) ensureClearBtn();
}





export default autocomplete;
