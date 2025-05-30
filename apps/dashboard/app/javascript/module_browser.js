import { hide, show } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-name]').forEach(card => {
    const versions = card.querySelectorAll("[data-role='selectable-version']");
    const infoBox = card.querySelector("[data-role='module-info']");
    const dependenciesContainer = infoBox.querySelector("[data-role='module-dependencies']");
    const loadCmdBox = infoBox.querySelector("[data-role='module-load-command']");

    versions.forEach(version => {
      version.addEventListener('click', () => {
        versions.forEach(v => v.classList.remove('selected-version'));
        version.classList.add('selected-version');
        updateVersionInfo(version);
      });
    });

    /** 
     * Updates dependency groups and load command based on the selected version.
     */
    function updateVersionInfo(selectedVersion) {
      const module = selectedVersion.dataset.module;
      const version = selectedVersion.dataset.version;
      const rawDeps = selectedVersion.dataset.dependencies;
      let depGroups = [];

      try {
        depGroups = JSON.parse(rawDeps);
      } catch {
        depGroups = [];
      }

      if (!Array.isArray(depGroups) || depGroups.length === 0) {
        loadCmdBox.textContent = `module load ${module}/${version}`;
        return;
      }
      
      const radioName = `dep-${module}`;
      const noneInput = infoBox.querySelector(`#dep_none_${module}`);

      // Clear previous radio buttons
      dependenciesContainer.innerHTML = '';

      // Create a radio button for each dependency group
      depGroups.forEach((group, index) => {

        const id = `${module}_depgrp_${index}`;
        const labelText = group.join(' + ');

        const wrapper = document.createElement('div');
        wrapper.className = 'form-check form-check-inline';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = radioName;
        input.className = 'form-check-input';
        input.id = id;
        input.value = group.join(' ');

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.setAttribute('for', id);
        label.textContent = labelText;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        dependenciesContainer.appendChild(wrapper);

        input.addEventListener('change', updateLoadCommand);
      });

      if (noneInput) {
        noneInput.checked = true;
        noneInput.addEventListener('change', updateLoadCommand);
      }

      updateLoadCommand();

      function updateLoadCommand() {
        const selected = infoBox.querySelector(`input[name="${radioName}"]:checked`)?.value || '';
        const depsPart = selected ? `${selected} ` : '';
        loadCmdBox.textContent = `module load ${depsPart}${module}/${version}`;
      }
    }
  });

  /*
    Copies the text content of the target element to the clipboard
  */
  document.querySelectorAll('[data-role="copy-btn"]').forEach(button => {
    button.addEventListener('click', () => {
      const selector = button.getAttribute('data-clipboard-target');
      const target = document.querySelector(selector);
      if (!target) return;
  
      const text = target.textContent;
      navigator.clipboard.writeText(text)
        .then(() => {
          button.textContent = 'Copied!';
          setTimeout(() => button.textContent = 'Copy', 2000);
        })
        .catch(err => {
          console.error('Clipboard write failed:', err);
        });
    });
  });

  /*
    Toggles the visibility of the module info box when the card is clicked
  */
  document.querySelectorAll('.collapse').forEach(collapse => {
    const card = collapse.closest('[data-name]');
    collapse.addEventListener('shown.bs.collapse', () => {
      if (card) card.classList.add('expanded');
    });

    collapse.addEventListener('hidden.bs.collapse', () => {
      if (card) card.classList.remove('expanded');
    });
  });

  /*
    Module search and filter
  */
  const moduleSearch = document.getElementById('module_search');
  const clusterFilter = document.getElementById('cluster_filter');

  function filterModules() {
    const searchQuery = moduleSearch.value.toLowerCase();
    const selectedCluster = clusterFilter.value;

    const modules = document.querySelectorAll('[data-name][data-clusters]');
    modules.forEach(function (module) {
      const name = module.getAttribute('data-name').toLowerCase();
      const clusters = module.getAttribute('data-clusters').split(',');

      const searchMatches = name.includes(searchQuery);
      const clusterMatches = !selectedCluster || clusters.includes(selectedCluster);

      if (searchMatches && clusterMatches) {
        show(module);
      } else {
        hide(module);
      }
    });
  }

  moduleSearch.addEventListener('input', filterModules);
  clusterFilter.addEventListener('change', filterModules);
});
