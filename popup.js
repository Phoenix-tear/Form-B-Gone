// This is the main script that gets executed on the page.
// It contains all your proven helper functions and the main loop.
function runTheAutomation() {
    
    // --- Helper Functions (Your proven code) ---

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function waitForOptionsToLoad(maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            const panel = document.querySelector('.select2-drop.select2-drop-active');
            if (panel && panel.querySelector('.select2-results li')) {
                const options = panel.querySelectorAll('li');
                console.log(`   ...found panel with ${options.length} options.`);
                return panel;
            }
            await delay(200);
        }
        console.log("   ...timed out waiting for a visible panel with options.");
        return null;
    }

    async function openDropdownAndWaitForOptions(container) {
        const choice = container.querySelector('.select2-choice');
        if (!choice) return null;
        
        console.log(`   ...clicking dropdown choice element`);
        choice.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        choice.click();
        
        console.log(`   ...waiting for options to load...`);
        const panel = await waitForOptionsToLoad();
        
        return panel;
    }

    function selectRandomOption(panel) {
        const results = panel.querySelector('.select2-results');
        if (!results) return false;
        
        const selectableOptions = Array.from(results.querySelectorAll('li.select2-result-selectable'));
        
        if (selectableOptions.length === 0) {
            console.warn("   ...could not find any valid selectable options.");
            return false;
        }
        
        const selectedOption = selectableOptions[Math.floor(Math.random() * selectableOptions.length)];
        
        console.log(`   ...selecting "${selectedOption.textContent.trim()}"`);
        selectedOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        selectedOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        selectedOption.click();
        return true;
    }

    // --- Main Automation Loop ---
    async function runFormAutomation() {
        console.log("--- Starting Zoho Form Automation (The Final 'Forceful Removal' Version) ---");

        const editableDropdowns = Array.from(document.querySelectorAll('.select2-container')).filter(container => {
            if (container.closest('.zc-readonly')) return false;
            const chosen = container.querySelector('.select2-chosen');
            return chosen && chosen.textContent.includes('-Select-');
        });
        
        console.log(`Found ${editableDropdowns.length} editable dropdowns to fill.`);
        
        for (let i = 0; i < editableDropdowns.length; i++) {
            const container = editableDropdowns[i];
            console.log(`Processing dropdown ${i + 1}/${editableDropdowns.length}...`);
            
            try {
                const panel = await openDropdownAndWaitForOptions(container);
                
                if (panel) {
                    const wasSelectionSuccessful = selectRandomOption(panel);
                    
                    if (wasSelectionSuccessful) {
                        const activePanel = document.querySelector('.select2-drop.select2-drop-active');
                        if (activePanel) {
                            console.log("   ...forcefully removing the active panel from the DOM.");
                            activePanel.remove();
                        }
                    }
                } else {
                    console.warn("   ...failed to open dropdown or load options");
                }
                
            } catch (error) {
                console.error(`   ...error processing dropdown: ${error.message}`);
            }
            
            await delay(300);
        }

        console.log("--- Dropdown automation complete. ---");

        const textFields = document.querySelectorAll('textarea[name*="Comments"]');
        console.log(`Found ${textFields.length} comment boxes to fill.`);
        
        textFields.forEach((field, index) => {
            field.value = 'good';
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('blur', { bubbles: true }));
            console.log(`   ...filled comment box ${index + 1}`);
        });

        console.log("--- Comment box filling complete. ---");
        console.log("\n✅ Automation Finished! The form is ready.");
    }

    // Run the main function
    runFormAutomation();
}

// This is the code that connects the popup button to the automation script.
document.getElementById('fillFormButton').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: runTheAutomation,
  });
});
