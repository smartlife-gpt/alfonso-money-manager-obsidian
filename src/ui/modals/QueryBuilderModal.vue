<template>
  <div class="modal-bg" style="opacity: 0.85"></div>
  <div class="modal" style="width: 1000px;">

    <div class="modal-close-button" @click="closeModal"></div>
    <div class="modal-title">Alfonso query generator</div>
    <div class="modal-content">

      <div class="container">
        <div class="side-by-side">
          <h2>Query:</h2>
          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Select database</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <select v-model="selectedDatabase" @change="onDbSelect($event)" style="width: 300px;">
                <option v-for="database in settings?.databaseLocations" :value="database" :key="database">{{ database }}
                </option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Select wallet</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <select v-model="selectedWallet" @change="onWalletSelect" style="width: 300px;">
                <option v-for="wallet in selectedDatabaseObject?.wallets.getAll()" :value="wallet.$loki"
                  :key="wallet.$loki">
                  {{ wallet.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Type</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <select v-model="selectedType" style="width: 300px;">
                <option v-for="type in ['expense', 'income', 'all']" :value="type" :key="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Start date</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <VueDatePicker v-model="startDate" class="date-picker" dark></VueDatePicker>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">End date</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <VueDatePicker v-model="endDate" class="date-picker" dark></VueDatePicker>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Min amount</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <input type="number" v-model="minAmount" :min="0" />
            </div>

            <div class="setting-item-info" style="margin-left: 20px;">
              <div class="setting-item-name">Max amount</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <input type="number" v-model="maxAmount" :min="0" />
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Add events</div>
              <div class="setting-item-description">
              </div>
            </div>
            <div class="setting-item-control">
              <button class="mod-cta" @click="selectEvent">
                Add event
              </button>
            </div>
          </div>

          <h4>Selected events:</h4>
          <div class="setting-item" v-for="event in selectedEvents" :key="event.$loki">
            <div class="setting-item-control" style="width: 100%;">
              {{ event.name }}
              <div class="clickable-icon setting-editor-extra-setting-button" aria-label="Delete"
                @click="removeEvent(event)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="svg-icon lucide-x">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Add categories</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <button class="mod-cta" @click="selectCategory">
                Add category
              </button>
            </div>
          </div>

          <div class="setting-item mod-toggle">
            <div class="setting-item-info">
              <div class="setting-item-name">Include category children</div>
              <div class="setting-item-description">
                When enabled, all transactions from the selected categories and their children will be included.
              </div>
            </div>
            <div class="setting-item-control">
              <div class="checkbox-container is-enabled">
                <input type="checkbox" tabindex="0" v-model="includeCategoryChildren">
              </div>
            </div>
          </div>

          <h4>Selected categories:</h4>
          <div class="setting-item" v-for="category in selectedCategories" :key="category.$loki">
            <div class="setting-item-control" style="width: 100%;">
              {{ category.name }}
              <div class="clickable-icon setting-editor-extra-setting-button" aria-label="Delete"
                @click="removeCategory(category)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="svg-icon lucide-x">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="side-by-side">
          <h2>Chart config:</h2>


          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Chart type</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <select v-model="selectedChartType" style="width: 300px;">
                <option v-for="chartType in chartTypes" :value="chartType" :key="chartType">{{ chartType }}
                </option>
              </select>
            </div>
          </div>

          <!-- Add TransactionGroupType select-->
          <div class="setting-item">
            <div class="setting-item-info">
              <div class="setting-item-name">Groyp by</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <select v-model="selectedTransactionGroupType" style="width: 300px;">
                <option v-for="transactionGroupType in transactionGroupTypes" :value="transactionGroupType"
                  :key="transactionGroupType">{{ transactionGroupType }}
                </option>
              </select>
            </div>
          </div>


          <div class="setting-item" v-if="selectedTransactionGroupType == 'date'">
            <div class="setting-item-info">
              <div class="setting-item-name">Groyp by period</div>
              <div class="setting-item-description"></div>
            </div>
            <div class="setting-item-control">
              <select v-model="selectedTransactionGroupTypePeriod" style="width: 300px;">
                <option v-for="period in transactionGroupTypePeriods" :value="period" :key="period">{{ period }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-button-container">
        <button class="mod-cta" @click="pasteToCursor">
          Paste to cursor
        </button>
        <button class="mod-cta" @click="copyToClipboard">
          Copy to clipboard
        </button>
        <button @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { DBAlfonso } from "@/database/DBAlfonso";
import DBQuery from "@/database/DBQuery";
import type AlfonsoPlugin from "@/main";
import type { QueryBuilderModal } from "@/modals/QueryBuilderModal";
import type { CategoryType } from "@/types/CategoryType";
import type { EventType } from "@/types/EventType";
import type { AlfonsoPluginSettings } from "@/types/MyPluginSettings";
import type { PeriodType } from "@/types/PeriodType";
import type { ChartType, TransactionSearchFilter } from "@/types/TransactionFilterType";
import type { TransactionGroupType } from "@/types/TransactionRecordGroupType";
import { TransactionType } from "@/types/TransactionType";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { Notice } from "obsidian";
import { onMounted, ref } from "vue";

const selectedDatabaseObject = ref<DBAlfonso | undefined>();
const selectedDatabase = ref("");

const selectedWallet = ref();

const minAmount = ref();
const maxAmount = ref();

const startDate = ref();
const endDate = ref();

const selectedType = ref<TransactionType>(TransactionType.All);

const selectedEvents = ref<EventType[]>([]);
const selectedCategories = ref<CategoryType[]>([]);
const includeCategoryChildren = ref(true);

const selectedChartType = ref<ChartType>("line");
const chartTypes = ["pie", "line", "bar", "SUM", "AVG", "MIN", "MAX", "COUNT"]

const selectedTransactionGroupType = ref<TransactionGroupType>("date");
const transactionGroupTypes = [
  "date", "category",
  //  "contact", "event", "transaction"
]

const selectedTransactionGroupTypePeriod = ref<PeriodType>("daily");
const transactionGroupTypePeriods = [
  "daily", "weekly", "monthly", "quarterly", "yearly"
]

const props = defineProps<{
  plugin: AlfonsoPlugin;
  modal: QueryBuilderModal;
  humanQuery?: string;
}>();


const closeModal = () => {
  props.modal.close();
};

const settings = ref<AlfonsoPluginSettings | undefined>(undefined)

const onDbSelect = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selected = target.value;
  selectedDatabaseObject.value = await props.plugin.getDatabase(selected);
  selectedWallet.value = null
  selectedCategories.value = []
  selectedEvents.value = []
};

const onWalletSelect = async () => {
  selectedCategories.value = []
  selectedEvents.value = []
};

const selectCategory = async () => {
  if (!selectedDatabaseObject.value) {
    new Notice("Please select a database first");
    return;
  }
  if (!selectedWallet.value) {
    new Notice("Please select a wallet first");
    return;
  }

  props.modal.categorySelectModal.openToSelect(selectedDatabase.value, selectedWallet.value);
};

const removeCategory = (category: CategoryType) => {
  selectedCategories.value = selectedCategories.value.filter((c) => c.$loki !== category.$loki);
};

const selectEvent = async () => {
  if (!selectedDatabaseObject.value) {
    new Notice("Please select a database first");
    return;
  }
  if (!selectedWallet.value) {
    new Notice("Please select a wallet first");
    return;
  }

  props.modal.eventSelectModal.openToSelect(selectedDatabase.value, selectedWallet.value);
};
const removeEvent = (event: EventType) => {
  selectedEvents.value = selectedEvents.value.filter((e) => e.$loki !== event.$loki);
};

const createTransactionSearchFilter = () => {
  const transactionFilter: TransactionSearchFilter = {
    database: selectedDatabase.value,
    wallet: selectedWallet.value,
    // note: searchQuery.value,
    amount: minAmount.value && maxAmount.value
      ? { type: "between", min: minAmount.value, max: maxAmount.value }
      : minAmount.value
        ? { type: "over", value: minAmount.value }
        : maxAmount.value
          ? { type: "under", value: maxAmount.value }
          : undefined,
    date: startDate.value && endDate.value
      ? { type: "between", start: startDate.value, end: endDate.value }
      : startDate.value
        ? { type: "after", date: startDate.value }
        : endDate.value
          ? { type: "before", date: endDate.value }
          : { type: "all" },
    category: {
      includeChildren: includeCategoryChildren.value,
      categories: selectedCategories.value
    },
    event: {
      events: selectedEvents.value
    },
    type: selectedType.value
  };

  transactionFilter.chartType = selectedChartType.value
  transactionFilter.groupBy = selectedTransactionGroupType.value
  transactionFilter.groupByPeriod = selectedTransactionGroupTypePeriod.value
  return transactionFilter;
}

const fromTransactionSearchFilter = (transactionFilter: TransactionSearchFilter) => {
  selectedDatabase.value = transactionFilter.database
  selectedWallet.value = transactionFilter.wallet
  // searchQuery.value = transactionFilter.note
  if (transactionFilter.amount?.type === "between") {
    minAmount.value = transactionFilter.amount?.min
    maxAmount.value = transactionFilter.amount?.max
  } else if (transactionFilter.amount?.type === "over") {
    minAmount.value = transactionFilter.amount?.value
  } else if (transactionFilter.amount?.type === "under") {
    maxAmount.value = transactionFilter.amount?.value
  } else {
    minAmount.value = undefined
    maxAmount.value = undefined
  }
  if (transactionFilter.date?.type === "between") {
    startDate.value = transactionFilter.date?.start
    endDate.value = transactionFilter.date?.end
  } else if (transactionFilter.date?.type === "after") {
    startDate.value = transactionFilter.date?.date
  } else if (transactionFilter.date?.type === "before") {
    endDate.value = transactionFilter.date?.date
  } else {
    startDate.value = undefined
    endDate.value = undefined
  }
  if (transactionFilter.category) {
    selectedCategories.value = transactionFilter.category.categories
    includeCategoryChildren.value = transactionFilter.category.includeChildren
  }

  if (transactionFilter.event)
    selectedEvents.value = transactionFilter.event.events

  selectedType.value = transactionFilter.type || TransactionType.All
  selectedChartType.value = transactionFilter.chartType || "line"
  selectedTransactionGroupType.value = transactionFilter.groupBy || "date"
  selectedTransactionGroupTypePeriod.value = transactionFilter.groupByPeriod || "daily"
}

const copyToClipboard = () => {
  if (!selectedDatabaseObject.value) return
  const transactionFilter = createTransactionSearchFilter();
  const query = selectedDatabaseObject.value.dbQuery.generateHumanQuery(transactionFilter);
  navigator.clipboard.writeText(query);
  new Notice("Query copied to clipboard");
}

const pasteToCursor = () => {
  if (!selectedDatabaseObject.value) return
  const transactionFilter = createTransactionSearchFilter();
  const query = selectedDatabaseObject.value.dbQuery.generateHumanQuery(transactionFilter);
  props.modal.close(query);
}

onMounted(async () => {
  settings.value = await props.plugin.loadData();

  props.modal.categorySelectModal.onSelected((category) => {
    if (!selectedCategories.value.some((c) => c.$loki === category.$loki))
      selectedCategories.value.push(category);
  });

  props.modal.eventSelectModal.onSelected((event) => {
    if (!selectedEvents.value.some((e) => e.$loki === event.$loki))
      selectedEvents.value.push(event);
  });

  if (props.humanQuery && props.humanQuery.length > 0) {
    const database = DBQuery.getDatabaseLocationFromQuery(props.humanQuery)
    if (!database) return
    selectedDatabaseObject.value = await props.plugin.getDatabase(database);

    const parsedQuery = selectedDatabaseObject.value?.dbQuery.parseHumanQuery(props.humanQuery)

    if (parsedQuery) {
      fromTransactionSearchFilter(parsedQuery)
    }
  }
});
</script>

<style scoped>
.date-picker {
  width: 300px;
}

.container {
  display: flex;
  /* This enables Flexbox */
}

.side-by-side {
  width: 50%;
  flex: 1;
  padding: 10px;
  margin: 5px;
}
</style>
