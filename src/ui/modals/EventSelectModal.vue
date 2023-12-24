<template>
  <div class="modal-bg" style="opacity: 0.85:"></div>
  <div class="modal" style="width:300px; height:600px">
    <div class="modal-close-button" @click="closeModal"></div>
    <div class="modal-title">Alfonso event select</div>
    <div class="modal-content" style="height: 1000px;">
      <div class="modal-tab-container">
        <button class="modal-tab" :class="{ active: active === true }" @click="active = true">
          Active
        </button>
        <button class="modal-tab" :class="{ active: active === false }" @click="active = false">
          Finished
        </button>
      </div>

      <div class="search-input-container" style="margin-top: 20px;">
        <input enterkeyhint="search" type="search" spellcheck="false" v-model="eventSearch">
        <div class="search-input-clear-button" @click="eventSearch = ''"></div>
      </div>

      <div class="setting-item" v-for="event in events" :key="event.$loki" @click="selectEvent(event)">
        <div class="setting-item-info">
          <div class="setting-item-name">
            {{ event.name }}
          </div>
          <div class="setting-item-description"></div>
        </div>
        <div class="setting-item-control">
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { DBAlfonso } from "@/database/DBAlfonso";
import type AlfonsoPlugin from "@/main";
import type { EventSelectModal } from "@/modals/EventSelectModal";
import type { EventType } from "@/types/EventType";
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
  plugin: AlfonsoPlugin;
  modal: EventSelectModal;
  database: string;
  walletID: number
}>();

const db = ref<DBAlfonso | undefined>();

const active = ref(true);

const eventSearch = ref("");
const events = computed(() => {
  return db.value?.events.getAllEvents(props.walletID, active.value)
    .filter((c) => c.name.toLowerCase().includes(eventSearch.value.toLowerCase()))
    ?? [];
});

const selectEvent = (event: EventType) => {
  props.modal.notifyObservers(event);
  closeModal();
};

const closeModal = () => {
  props.modal.close();
};

onMounted(async () => {
  db.value = await props.plugin.getDatabase(props.database)
});
</script>

<style scoped></style>
