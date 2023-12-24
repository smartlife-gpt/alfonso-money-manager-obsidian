<template>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Show query builder button</div>
      <div class="setting-item-description">
        This button will appear above each chart for faster access to the query builder
      </div>
    </div>
    <div class="setting-item-control">
      <input type="checkbox" v-model="settings.showQueryBuilderButton" @change="save" />
    </div>
  </div>

  <h2>Alfonso database locations</h2>
  <div class="setting-item">
    <div class="setting-item-control">
      <div class="search-input-container database-input">
        <input v-model="databaseLocation" @input="searchFolders" enterkeyhint="search" type="search" spellcheck="false"
          placeholder="Database location path eg. alfonso/default">
        <div class="search-input-clear-button" @click="databaseLocation = ''"></div>
        <div class="suggestion-container">
          <div class="suggestion">
            <div class="suggestion-item" v-for="folder in folderSuggestions" :key="folder" @click="selectFolder(folder)">
              {{ folder }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <h2>Database locations</h2>
  <div class="setting-item" v-for="location in settings.databaseLocations" :key="location">
    <div class="setting-item-control" style="width: 100%;">
      {{ location }}
      <div class="clickable-icon setting-editor-extra-setting-button" aria-label="Delete"
        @click="deleteLocation(location)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-x">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </div>
  </div>

  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name"></div>
      <div class="setting-item-description"></div>
    </div>
    <div class="setting-item-control">
      <button class="mod-cta" @click="addLocation">Add to the list</button>
    </div>
  </div>

  <!-- <div class="setting-item-control" style="margin-top: 18px">
    <button @click="settings = defaultSettings()">Restore defaults</button>
    <button class="mod-cta" @click="save">Save Settings</button>
  </div> -->
</template>
<script lang="ts" setup>
import type AlfonsoPlugin from "@/main";
import { Notice, TFolder } from "obsidian";
import { onMounted, ref } from "vue";

const defaultSettings = () => ({
  databaseLocations: [] as string[],
  showQueryBuilderButton: true,
});
const settings = ref(defaultSettings());

const allLoadedFolders = ref<TFolder[]>([]);
const folderSuggestions = ref<string[]>([]);

const databaseLocation = ref("");
const props = defineProps<{
  plugin: AlfonsoPlugin;
}>();

const searchFolders = () => {
  const search = databaseLocation.value;
  if (search.length < 3) {
    folderSuggestions.value = [];
    return;
  }
  const suggestions = allLoadedFolders.value
    .map((folder) => folder.path)
    .filter((path) => path.includes(search));

  folderSuggestions.value = suggestions;
};

const selectFolder = (folder: string) => {
  databaseLocation.value = folder;
  folderSuggestions.value = [];
};

const addLocation = () => {
  //check if it is a valid path
  if (!allLoadedFolders.value.some((folder) => folder.path === databaseLocation.value)) {
    new Notice("Invalid path");
    return;
  }

  if (settings.value.databaseLocations.includes(databaseLocation.value)) {
    new Notice("Path already added");
    return;
  }

  if (!props.plugin.isValidDatabaseLocation(databaseLocation.value)) {
    new Notice("This location does not contain a valid database");
    return;
  }

  settings.value.databaseLocations.push(databaseLocation.value);
  save();

  databaseLocation.value = "";
};

const deleteLocation = (location: string) => {
  settings.value.databaseLocations = settings.value.databaseLocations.filter((loc) => loc !== location);
  save();
};

const save = async () => {
  const newSeeting = {
    ...settings.value,
  };
  await props.plugin.saveSettings(newSeeting);
  new Notice("Saved");
};

onMounted(async () => {
  if (props.plugin) {
    const loadedData = await props.plugin.loadData();
    settings.value = {
      ...defaultSettings(),
      ...loadedData,
    }

    allLoadedFolders.value = [];
    const folders = props.plugin.app.vault.getAllLoadedFiles();
    for (const folder of folders) {
      if (folder instanceof TFolder)
        allLoadedFolders.value.push(folder);
    }
  }
});
</script>

<style scoped>
.database-input {
  width: calc(100% - 20px);
}

.suggestion-item {
  cursor: pointer;
}
</style>
