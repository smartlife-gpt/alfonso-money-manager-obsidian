<template>
  <div class="modal-bg" style="opacity: 0.85:"></div>
  <div class="modal" style="width:300px; height:600px">
    <div class="modal-close-button" @click="closeModal"></div>
    <div class="modal-title">Alfonso category select</div>
    <div class="modal-content" style="height: 1000px;">
      <div class="modal-tab-container">
        <button class="modal-tab" :class="{ active: type === TransactionType.Expense }"
          @click="type = TransactionType.Expense">
          Expense
        </button>
        <button class="modal-tab" :class="{ active: type === TransactionType.Income }"
          @click="type = TransactionType.Income">
          Income
        </button>
        <button class="modal-tab" :class="{ active: type === TransactionType.DebtLoan }"
          @click="type = TransactionType.DebtLoan">
          Debt/Loan
        </button>
      </div>

      <div class="search-input-container" style="margin-top: 20px;">
        <input enterkeyhint="search" type="search" spellcheck="false" v-model="categorySearch"
          placeholder="Example: Rent">
        <div class="search-input-clear-button" @click="categorySearch = ''"></div>
      </div>

      <div class="setting-item" v-for="category in categories" :key="category.$loki" @click="selectCategory(category)">
        <div class="setting-item-info">
          <div class="setting-item-name">
            <span class="setting-item-name-text" :class="{ 'category-child': category.parent }">
              {{ category.name }}
            </span>
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
import type { CategorySelectModal } from "@/modals/CategorySelectModal";
import type { CategoryType } from "@/types/CategoryType";
import { TransactionType } from "@/types/TransactionType";
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
  plugin: AlfonsoPlugin;
  modal: CategorySelectModal;
  database: string;
  walletID: number
}>();

const db = ref<DBAlfonso | undefined>();

const type = ref(TransactionType.Expense);

const categorySearch = ref("");
const categories = computed(() => {
  return db.value?.categories.getCategories(type.value, props.walletID, true)
    .filter((c) => c.name.toLowerCase().includes(categorySearch.value.toLowerCase()))
    ?? [];
});

const selectCategory = (category: CategoryType) => {
  props.modal.notifyObservers(category);
  closeModal();
};

const closeModal = () => {
  props.modal.close();
};

onMounted(async () => {
  db.value = await props.plugin.getDatabase(props.database)
});
</script>

<style scoped>
.category-child {
  margin-left: 30px;
}
</style>
