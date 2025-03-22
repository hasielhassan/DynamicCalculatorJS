/**
 * Sanitize a name by replacing disallowed characters.
 * Allowed characters: letters, numbers, underscores.
 *
 * @param {string} name - The input name.
 * @return {string} The sanitized name.
 */
function dcSanitizeName(name) {
    return name.replace(/[^A-Za-z0-9_]/g, '_');
  }
  
  /**
   * Build dynamic calculators.
   * This function finds all elements with the class 
   * "DynamicCalculator", applies styling, and wires up 
   * HyperFormula-based calculations.
   */
  function BuildDynamicCalculators() {
    // Get all calculator containers.
    const calculators = document.querySelectorAll(
      '.DynamicCalculator'
    );
  
    // Apply base styling to each calculator.
    calculators.forEach((calculator) => {
      // Add container styling.
      calculator.classList.add('calc-container');
  
      // Insert a title element.
      const titleText = calculator.dataset.title ||
        'Dynamic Calculator';
      const titleElem = document.createElement('h2');
      titleElem.classList.add('calc-title');
      titleElem.textContent = titleText;
      calculator.insertBefore(titleElem, calculator.firstChild);
  
      // Add styling to all label elements.
      const labels = calculator.querySelectorAll('label');
      labels.forEach((label) => {
        label.classList.add('calc-label');
      });
  
      // Add styling to all input elements.
      const inputs = calculator.querySelectorAll('input');
      inputs.forEach((input) => {
        input.classList.add('calc-input');
      });
  
      // Style result placeholders.
      const results = calculator.querySelectorAll(
        '.CalculatedResult'
      );
      results.forEach((result) => {
        result.classList.add('calc-result-value');
      });
    });
  
    // Process each calculator for HyperFormula setup.
    calculators.forEach((calculator, index) => {
      // Create a new HyperFormula instance globally.
      const hf = HyperFormula.buildEmpty({
        licenseKey: 'gpl-v3'
      });
  
      // Define a unique prefix for named expressions.
      const prefix = 'calc' + index + '_';
  
      // Map base input names to global names.
      const inputNames = [];
  
      // Process each input element.
      const inputs = calculator.querySelectorAll('input');
      inputs.forEach((input) => {
        const baseName = input.id;
        if (!baseName) return;
        const globalName = prefix + baseName;
        inputNames.push({ base: baseName, global: globalName });
        const initialValue = parseFloat(input.value) || 0;
        if (!isFinite(initialValue)) return;
        hf.addNamedExpression(globalName, initialValue);
  
        // Update named expression on input change.
        input.addEventListener('input', (e) => {
          const newValue = parseFloat(e.target.value) || 0;
          try {
            hf.removeNamedExpression(globalName);
          } catch (error) {
            // Ignore if expression does not exist.
          }
          hf.addNamedExpression(globalName, newValue);
          updateResults();
        });
      });
  
      // Process each result element.
      const results = calculator.querySelectorAll(
        '.CalculatedResult'
      );
      results.forEach((result) => {
        const formula = result.dataset.formula;
        const origName = result.id;
        if (!origName || !formula) return;
        // Sanitize the result name with the unique prefix.
        const validResultName = dcSanitizeName(prefix + origName);
        result.dataset.validName = validResultName;
        // Replace input references with their global names.
        let updatedFormula = formula;
        inputNames.forEach(({ base, global }) => {
          const regex = new RegExp('\\b' + base + '\\b', 'g');
          updatedFormula = updatedFormula.replace(regex, global);
        });
        // Add the formula (with leading '=') as a named expression.
        hf.addNamedExpression(
          validResultName,
          '=' + updatedFormula
        );
      });
  
      /**
       * Update result display by fetching computed values.
       */
      function updateResults() {
        results.forEach((result) => {
          const validName = result.dataset.validName;
          if (!validName) return;
          const val = hf.getNamedExpressionValue(validName);
          console.log("Result for", validName, ":", val);
          result.textContent = val;
        });
      }
  
      // Initial update to display results.
      updateResults();
    });
  }
  