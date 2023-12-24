import DBQuery from "@/database/DBQuery";
import type AlfonsoPlugin from "@/main";
import { QueryBuilderModal } from "@/modals/QueryBuilderModal";
import type { ChartRecordGroupType } from "@/types/ChartRecordGroupType";
import ApexCharts from "apexcharts";
import { MarkdownView } from "obsidian";
export default class CodeBlockProcessor {
  plugin: AlfonsoPlugin;
  constructor(plugin: AlfonsoPlugin) {
    this.plugin = plugin;
  }

  async renderChart(src: string, rootEl: HTMLElement) {
    const databaseLocation = DBQuery.getDatabaseLocationFromQuery(src);
    if (!databaseLocation) return;

    const db = await this.plugin.getDatabase(databaseLocation);
    if (!db) {
      return;
    }
    const queryResult = db.executeHumanQuery(src);
    if (!queryResult) {
      rootEl.createEl("div", {
        cls: "no-results",
        text: "No Results for Alfonso Query",
      });
      return;
    }

    if (["bar", "line", "pie"].includes(queryResult.chartType)) {
      this.renderApexChart(queryResult, rootEl);
    } else if (queryResult.result) {
      //Render text with result and chart type
      rootEl.createEl("div", {
        cls: "no-results",
        attr: {
          style: queryResult.result.amount > 0 ? "color: green" : "color: red",
        },
        text: `${queryResult.result.amount} ${queryResult.result.currency}`,
      });
    } else {
      rootEl.createEl("div", {
        cls: "no-results",
        text: "No Results for Alfonso Query",
      });
    }
  }

  renderApexChart(queryResult: ChartRecordGroupType, rootEl: HTMLElement) {
    const options = {
      chart: {
        id: "bar-chart",
        type: queryResult.chartType || "line",
        toolbar: {
          show: true,
        },
      },
      tooltip: {
        theme: "dark",
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#428cff",
          },
        },
      },
      xaxis: {
        categories: [...new Set(queryResult.labels ?? [])],
        labels: {
          style: {
            colors: "#428cff",
          },
        },
        colors: queryResult.colors ?? [],
      },
      plotOptions: {
        bar: {
          distributed: false,
        },
      },
      legend: {
        show: queryResult.chartType === "pie",
      },
      labels: queryResult.labels ?? [],
      series: queryResult.series ?? [],
    };

    const chart = new ApexCharts(rootEl, options);
    chart.render();
  }

  async toggleEditMode(cursorLine: number) {
    // Get the active leaf
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);

    if (!view || view.getMode() == "source") return;

    const viewState = view.leaf.getViewState();
    viewState.state.mode = "source";
    await view.leaf.setViewState(viewState);

    const editor = view.editor;
    if (!editor) return;
    editor.focus();
    editor.setCursor({ line: cursorLine, ch: 0 });
  }

  register() {
    this.plugin.registerMarkdownCodeBlockProcessor(
      "alfonso",
      async (src, el, ctx) => {
        const rootEl = el.createEl("div", {
          cls: "alfonso-block",
        });
        const buttonContainer = rootEl.createEl("div", {
          cls: "button-container",
        });
        const chartContainer = rootEl.createEl("div", {
          cls: "chart-container",
        });

        const button = buttonContainer.createEl("button", {
          cls: "button",
          text: "Query Builder",
        });

        button.addEventListener("click", async () => {
          const myModal = new QueryBuilderModal(this.plugin.app, this.plugin);
          const sectionInfo = ctx.getSectionInfo(chartContainer);
          const startCodeLine = sectionInfo?.lineStart ?? 0;
          const endCodeLine = sectionInfo?.lineEnd ?? 0;
          const middleCodeLine = Math.floor((startCodeLine + endCodeLine) / 2);

          await this.toggleEditMode(middleCodeLine);

          myModal.open(src);
        });

        if (!this.plugin.settings.showQueryBuilderButton) {
          buttonContainer.style.display = "none";
        }

        this.plugin.onSettingsChanged((settings) => {
          if (settings.showQueryBuilderButton) {
            buttonContainer.style.display = "block";
          } else {
            buttonContainer.style.display = "none";
          }
        });

        //render the chart
        await this.renderChart(src, chartContainer);
      }
    );
  }
}
