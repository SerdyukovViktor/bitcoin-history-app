import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { useSSRContext } from 'vue';
import { _ as _export_sfc } from './server.mjs';
import '../runtime.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';

Chart.register(...registerables);
function createChart(ctx, data, minYRounded) {
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.x,
      datasets: [{
        label: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0432\u0430\u043B\u044E\u0442\u0435",
        data: data.y,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        pointRadius: "0",
        // backgroundColor: [
        //   'rgba(129, 212, 250, 0.8)',
        //   'rgba(129, 212, 250, 0.8)',
        //   'rgba(129, 212, 250, 0.8)',
        //   'rgba(129, 212, 250, 0.8)',
        //   'rgba(129, 212, 250, 0.8)',
        //   'rgba(129, 212, 250, 0.8)',
        // ],
        // borderColor: [
        //   'rgba(59, 130, 246, 1)',
        //   'rgba(59, 130, 246, 1)',
        //   'rgba(59, 130, 246, 1)',
        //   'rgba(59, 130, 246, 1)',
        //   'rgba(59, 130, 246, 1)',
        //   'rgba(59, 130, 246, 1)',
        // ],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 12,
            autoSkip: true
          }
        },
        y: {
          min: minYRounded
        }
      }
    }
  });
  return chart;
}
async function getDBData(startDate, endDate) {
  try {
    const response = await axios.get(`http://localhost:3001/api/prices`, {
      params: {
        startDate,
        endDate
      }
    });
    const data = response.data;
    if (data && data.length > 0) {
      const usdData = data.filter((item) => item.currency === "USD");
      const gbpData = data.filter((item) => item.currency === "GBP");
      const eurData = data.filter((item) => item.currency === "EUR");
      return { usd: usdData, gbp: gbpData, eur: eurData };
    } else {
      return null;
    }
  } catch (error) {
    alert(`\u0412 \u0431\u0430\u0437\u0435 \u0434\u0430\u043D\u043D\u044B\u0445 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0437\u0430\u043F\u0438\u0441\u0438 \u0437\u0430 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434`);
    return null;
  }
}
async function getTodayData() {
  const today = /* @__PURE__ */ new Date();
  const startDate = new Date(today.setUTCHours(0, 0, 0, 0)).toISOString();
  const endDate = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString();
  return await getDBData(startDate, endDate);
}
async function getWeekData() {
  const today = /* @__PURE__ */ new Date();
  const weekAgo = /* @__PURE__ */ new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setUTCHours(0, 0, 0, 0);
  const startDate = weekAgo.toISOString();
  const endDate = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString();
  return await getDBData(startDate, endDate);
}
async function getMonthData() {
  const today = /* @__PURE__ */ new Date();
  const monthAgo = /* @__PURE__ */ new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  monthAgo.setUTCHours(0, 0, 0, 0);
  const startDate = monthAgo.toISOString();
  const endDate = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString();
  return await getDBData(startDate, endDate);
}
async function getYearData() {
  const today = /* @__PURE__ */ new Date();
  today.setUTCHours(today.getHours() + 3);
  const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate(), 24, 0, 0, 0);
  const startDate = yearAgo.toISOString();
  const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
  return await getDBData(startDate, endDate);
}
async function getCustomData(startDate, endDate) {
  if (startDate && endDate) {
    const lastDate = new Date(endDate);
    const customEndDate = new Date(lastDate.setUTCHours(23, 59, 59, 999)).toISOString();
    return await getDBData(startDate, customEndDate);
  } else {
    return null;
  }
}
const _sfc_main = {
  data() {
    return {
      charts: {
        USD: {
          x: [],
          y: []
        },
        GBP: {
          x: [],
          y: []
        },
        EUR: {
          x: [],
          y: []
        }
      },
      chartType: "USD",
      chart: null,
      periodType: "day",
      showCustomDateInputs: false,
      customStartDate: "",
      customEndDate: "",
      errorMsg: null,
      isInvalidDate: false
    };
  },
  async created() {
    if (this.periodType === "custom") {
      if (this.customStartDate && this.customEndDate) {
        this.updateData(this.customStartDate, this.customEndDate);
      }
    } else {
      this.updateData();
    }
  },
  watch: {
    customStartDate() {
      this.checkDate();
    },
    customEndDate() {
      this.checkDate();
    },
    periodType: {
      handler() {
        if (this.periodType === "custom") {
          this.updateData(this.customStartDate, this.customEndDate);
        }
      }
    }
  },
  methods: {
    checkDate() {
      if (this.customStartDate && this.customEndDate) {
        if (this.customEndDate < this.customStartDate) {
          this.errorMsg = "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435! \u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F \u043C\u0435\u043D\u044C\u0448\u0435 \u0434\u0430\u0442\u044B \u043D\u0430\u0447\u0430\u043B\u0430";
          this.isInvalidDate = true;
        } else {
          this.errorMsg = null;
          this.isInvalidDate = false;
        }
      }
    },
    switchPeriodType() {
      if (this.periodType === "custom") {
        this.customStartDate = "";
        this.customEndDate = "";
      } else {
        this.showCustomDateInputs = false;
        this.$nextTick(() => {
          this.updateData();
        });
      }
    },
    sendRequest() {
      if (this.periodType === "custom") {
        const startDate = new Date(this.customStartDate).toISOString();
        const endDate = new Date(this.customEndDate).toISOString();
        if (startDate && endDate) {
          this.updateData(startDate, endDate);
        } else {
          console.log("\u041F\u0435\u0440\u0438\u043E\u0434 \u043D\u0435 \u0432\u043D\u0435\u0441\u0451\u043D");
        }
      }
    },
    switchChartType() {
      if (this.chart) {
        this.chart.destroy();
      }
      this.chartContext = (void 0).getElementById("chart-container").querySelector("canvas").getContext("2d");
      if (this.chartType) {
        this.chart = createChart(this.chartContext, this.charts[this.chartType]);
      }
    },
    drawChart() {
      const ctx = (void 0).getElementById("chart-container").querySelector("canvas").getContext("2d");
      this.chart = createChart(ctx, this.charts[this.chartType]);
    },
    async updateData(startDate = null, endDate = null) {
      if (this.chart) {
        this.chart.destroy();
      }
      if (this.periodType === "custom") {
        if (startDate && endDate) {
          this.checkDate();
          const customData = await getCustomData(startDate, endDate);
          const { usd, gbp, eur } = customData;
          const prices = [usd, gbp, eur].map((array) => array.map((item) => item.price));
          const timestamps = [usd, gbp, eur].map((array) => array.map((item) => item.timestamp));
          this.charts.USD.x = timestamps[0].map((timestamp) => {
            const date = new Date(timestamp);
            return date.toLocaleDateString();
          });
          this.charts.USD.y = prices[0];
          this.charts.GBP.x = timestamps[1].map((timestamp) => {
            const date = new Date(timestamp);
            return date.toLocaleDateString();
          });
          this.charts.GBP.y = prices[1];
          this.charts.EUR.x = timestamps[2].map((timestamp) => {
            const date = new Date(timestamp);
            return date.toLocaleDateString();
          });
          this.charts.EUR.y = prices[2];
          this.drawChart();
        } else {
          console.log("\u041D\u0443\u0436\u043D\u043E \u0432\u0432\u0435\u0442\u0438 \u043F\u0435\u0440\u0438\u043E\u0434");
        }
      } else if (this.periodType === "day") {
        const todayData = await getTodayData();
        const { usd, gbp, eur } = todayData;
        const prices = [usd, gbp, eur].map((array) => array.map((item) => item.price));
        const timestamps = [usd, gbp, eur].map((array) => array.map((item) => item.timestamp));
        this.charts.USD.x = timestamps[0].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        });
        this.charts.USD.y = prices[0];
        this.charts.GBP.x = timestamps[1].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        });
        this.charts.GBP.y = prices[1];
        this.charts.EUR.x = timestamps[2].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        });
        this.charts.EUR.y = prices[2];
        this.drawChart();
      } else if (this.periodType === "week") {
        const weekData = await getWeekData();
        const { usd, gbp, eur } = weekData;
        const prices = [usd, gbp, eur].map((array) => array.map((item) => item.price));
        const timestamps = [usd, gbp, eur].map((array) => array.map((item) => item.timestamp));
        this.charts.USD.x = timestamps[0].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.USD.y = prices[0];
        this.charts.GBP.x = timestamps[1].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.GBP.y = prices[1];
        this.charts.EUR.x = timestamps[2].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.EUR.y = prices[2];
        this.drawChart();
      } else if (this.periodType === "month") {
        const monthData = await getMonthData();
        const { usd, gbp, eur } = monthData;
        const prices = [usd, gbp, eur].map((array) => array.map((item) => item.price));
        const timestamps = [usd, gbp, eur].map((array) => array.map((item) => item.timestamp));
        this.charts.USD.x = timestamps[0].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.USD.y = prices[0];
        this.charts.GBP.x = timestamps[1].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.GBP.y = prices[1];
        this.charts.EUR.x = timestamps[2].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.EUR.y = prices[2];
        this.drawChart();
      } else if (this.periodType === "year") {
        const yearData = await getYearData();
        const { usd, gbp, eur } = yearData;
        const prices = [usd, gbp, eur].map((array) => array.map((item) => item.price));
        const timestamps = [usd, gbp, eur].map((array) => array.map((item) => item.timestamp));
        this.charts.USD.x = timestamps[0].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.USD.y = prices[0];
        this.charts.GBP.x = timestamps[1].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.GBP.y = prices[1];
        this.charts.EUR.x = timestamps[2].map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.EUR.y = prices[2];
        this.drawChart();
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<!--[--><div class="bg-slate-800 rounded-b-lg py-6 shadow-xl grid place-items-center"><div class="min-h-[300px] max-h-[800px]"><div class="h-[60vh] w-[80vw] relative" id="chart-container"><canvas id="chart" class="w-full h-full"></canvas></div></div></div><div class="rounded-md p-2 text-white mx-auto w-1/2"><div class="flex flex-col space-y-1"><div class="flex justify-between space-x-2"><select class="w-full p-2 bg-indigo-500 rounded-md shadow-lg"><option value="day"${ssrIncludeBooleanAttr(Array.isArray($data.periodType) ? ssrLooseContain($data.periodType, "day") : ssrLooseEqual($data.periodType, "day")) ? " selected" : ""}>\u0414\u0435\u043D\u044C</option><option value="week"${ssrIncludeBooleanAttr(Array.isArray($data.periodType) ? ssrLooseContain($data.periodType, "week") : ssrLooseEqual($data.periodType, "week")) ? " selected" : ""}>\u041D\u0435\u0434\u0435\u043B\u044F</option><option value="month"${ssrIncludeBooleanAttr(Array.isArray($data.periodType) ? ssrLooseContain($data.periodType, "month") : ssrLooseEqual($data.periodType, "month")) ? " selected" : ""}>\u041C\u0435\u0441\u044F\u0446</option><option value="year"${ssrIncludeBooleanAttr(Array.isArray($data.periodType) ? ssrLooseContain($data.periodType, "year") : ssrLooseEqual($data.periodType, "year")) ? " selected" : ""}>\u0413\u043E\u0434</option><option value="custom"${ssrIncludeBooleanAttr(Array.isArray($data.periodType) ? ssrLooseContain($data.periodType, "custom") : ssrLooseEqual($data.periodType, "custom")) ? " selected" : ""}>\u0421\u0432\u043E\u0439 \u043F\u0435\u0440\u0438\u043E\u0434</option></select><select class="w-full p-2 bg-indigo-500 rounded-md shadow-lg"${ssrIncludeBooleanAttr($data.isInvalidDate) ? " disabled" : ""}><option value="USD"${ssrIncludeBooleanAttr(Array.isArray($data.chartType) ? ssrLooseContain($data.chartType, "USD") : ssrLooseEqual($data.chartType, "USD")) ? " selected" : ""}>USD</option><option value="GBP"${ssrIncludeBooleanAttr(Array.isArray($data.chartType) ? ssrLooseContain($data.chartType, "GBP") : ssrLooseEqual($data.chartType, "GBP")) ? " selected" : ""}>GBP</option><option value="EUR"${ssrIncludeBooleanAttr(Array.isArray($data.chartType) ? ssrLooseContain($data.chartType, "EUR") : ssrLooseEqual($data.chartType, "EUR")) ? " selected" : ""}>EUR</option></select></div>`);
  if ($data.periodType === "custom") {
    _push(`<div><div class="grid grid-cols-1 md:grid-cols-2 gap-1"><div><label for="customStartDate">\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430:</label><input type="date" id="customStartDate" class="w-full text-black rounded-md shadow-lg"${ssrRenderAttr("value", $data.customStartDate)}></div><div><label for="customEndDate">\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F:</label><input type="date" id="customEndDate" class="w-full text-black rounded-md shadow-lg"${ssrRenderAttr("value", $data.customEndDate)}></div></div><div class="mt-2 text-center"><button class="w-1/2 p-2 bg-indigo-500 rounded-md shadow-lg"${ssrIncludeBooleanAttr($data.isInvalidDate) ? " disabled" : ""}>OK</button></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
  if ($data.errorMsg) {
    _push(`<div class="mx-auto text-red-500 mb-4 text-3xl">${ssrInterpolate($data.errorMsg)}</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-CqC8S8eM.mjs.map
