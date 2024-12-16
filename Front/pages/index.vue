<template>
  <!-- Панель отображения графика -->
    <div class="bg-slate-800 rounded-b-lg py-6 shadow-xl grid place-items-center">
      <div class="min-h-[300px] max-h-[800px]">
        <!-- <div class="flex justify-end mb-4">
          <span class="inline-flex items-center justify-center p-1 bg-indigo-500 rounded-md shadow-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"></svg>
          </span>
        </div> -->
          <div class="h-[60vh] w-[80vw] relative" id="chart-container">
            <canvas id="chart" class="w-full h-full"></canvas>
          </div>
      </div>
    </div>
        
  <!-- Панель управления графиком -->
    <div class="rounded-md p-2 text-white mx-auto w-1/2">
      <div class="flex flex-col space-y-1">
        <div class="flex justify-between space-x-2">
          <select class="w-full p-2 bg-indigo-500 rounded-md shadow-lg" v-model="periodType" @change="switchPeriodType">
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
            <option value="custom">Свой период</option>
          </select>
          <select class="w-full p-2 bg-indigo-500 rounded-md shadow-lg" :disabled="isInvalidDate" v-model="chartType" @change="switchChartType">
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div v-if="periodType === 'custom'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
              <div>
                <label for="customStartDate">Дата начала:</label>
                <input type="date" id="customStartDate" class="w-full text-black rounded-md shadow-lg" v-model="customStartDate">
              </div>
              <div>
                <label for="customEndDate">Дата окончания:</label>
                <input type="date" id="customEndDate" class="w-full text-black rounded-md shadow-lg" v-model="customEndDate">
              </div>
          </div>
          <div class="mt-2 text-center">
            <button class="w-1/2 p-2 bg-indigo-500 rounded-md shadow-lg" @click="sendRequest" :disabled="isInvalidDate">OK</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMsg" class=" mx-auto text-red-500 mb-4 text-3xl" >
      {{ errorMsg }}
    </div>
</template>

  <script>
  import { createChart } from '../components/chart';
  import { getTodayData, getWeekData, getMonthData, getYearData, getCustomData } from '../utils/api';

  export default {
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
          },
        },
        chartType: "USD",
        chart: null,
        periodType: "day",
        showCustomDateInputs: false,
        customStartDate: '',
        customEndDate: '',
        errorMsg: null,
        isInvalidDate : false,

      }
    },
    async created() {
      if (this.periodType === "custom") {
        if (this.customStartDate && this.customEndDate) {
          this.updateData(this.customStartDate, this.customEndDate);
        }
      } else{
        this.updateData();
      }
    },
    watch: {
      customStartDate () {
        this.checkDate();
      },
      customEndDate () {
          this.checkDate();
      },
      periodType: {
        handler() {
          if (this.periodType === "custom") {
            this.updateData(this.customStartDate, this.customEndDate);
          } else {
           'updateData'
          }
        }
      }
    },
    methods: {
      checkDate() {
        if (this.customStartDate && this.customEndDate) {
          if (this.customEndDate < this.customStartDate) {
            this.errorMsg = 'Внимание! Дата окончания меньше даты начала';
            this.isInvalidDate = true;
          } else {
            this.errorMsg = null;
            this.isInvalidDate = false;
          }
        }
      },
      switchPeriodType() {

        if (this.periodType === "custom") {
          this.customStartDate = '';
          this.customEndDate = '';
        } else {
          this.showCustomDateInputs = false;
          this.$nextTick(() => {
            this.updateData();
          })
        }
      },
      sendRequest() {
        if (this.periodType === 'custom') {
          const startDate = new Date(this.customStartDate).toISOString();
          const endDate = new Date(this.customEndDate).toISOString();

          if (startDate && endDate) {
            this.updateData(startDate, endDate);
          } else {
            console.log("Период не внесён");
          }

        }
      },
      switchChartType() {

        if(this.chart) {
          this.chart.destroy();
        }

        this.chartContext = document.getElementById('chart-container')
                                    .querySelector('canvas')
                                    .getContext('2d');

        if (this.chartType) {
          this.chart = createChart(this.chartContext, this.charts[this.chartType]);
        }

      },
      drawChart() {
        const ctx = document.getElementById('chart-container')
                                  .querySelector('canvas')
                                  .getContext('2d');
              this.chart = createChart(ctx, this.charts[this.chartType]);
      },
      async updateData(startDate = null, endDate = null) {

        if (this.chart) {
          this.chart.destroy();
        }


        if (this.periodType === "custom") {


        // П Е Р И О Д


            if (startDate && endDate) {

            this.checkDate();

            const customData = await getCustomData(startDate, endDate);

            // Обрабатываем полученные данные
            const { usd, gbp, eur } = customData;

            // Лупим данные в массивы для каждой валюты
            const prices = [usd, gbp, eur].map(array => array.map(item => item.price));
            const timestamps = [usd, gbp, eur].map(array => array.map(item => item.timestamp));

            // Засовываем в координаты данные по осям X и Y
            this.charts.USD.x = timestamps[0].map(timestamp => {              //[0] - потому что массив дат USD под индексом 0
              const date = new Date(timestamp);
              return date.toLocaleDateString();
            });
            this.charts.USD.y = prices[0];                                    //[0] - потому что массив цен USD под индексом 0

            // Засовываем в координаты данные по осям X и Y
            this.charts.GBP.x = timestamps[1].map(timestamp => {              //[1] - потому что массив дат GPB под индексом 0
              const date = new Date(timestamp);
              return date.toLocaleDateString();
            });
            this.charts.GBP.y = prices[1];                                    //[1] - потому что массив цен GBP под индексом 0

            // Засовываем в координаты данные по осям X и Y
            this.charts.EUR.x = timestamps[2].map(timestamp => {              //[2] - потому что массив дат EUR под индексом 0
              const date = new Date(timestamp);
              return date.toLocaleDateString();
            });
            this.charts.EUR.y = prices[2];                                    //[2] - потому что массив цен EUR под индексом 0

            // Отрисовываем график
            this.drawChart();

          } else {
            console.log("Нужно ввети период");
          }
      } else if (this.periodType === "day") {


        // Д Е Н Ь


        const todayData = await getTodayData();


        // Обрабатываем полученные данные
        const { usd, gbp, eur } = todayData;

        // Лупим данные в массивы для каждой валюты
        const prices = [usd, gbp, eur].map(array => array.map(item => item.price));
        const timestamps = [usd, gbp, eur].map(array => array.map(item => item.timestamp));

        // Засовываем в координаты данные по осям X и Y
        this.charts.USD.x = timestamps[0].map(timestamp => {              //[0] - потому что массив дат USD под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        });
        this.charts.USD.y = prices[0];                                    //[0] - потому что массив цен USD под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.GBP.x = timestamps[1].map(timestamp => {              //[1] - потому что массив дат GPB под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        });
        this.charts.GBP.y = prices[1];                                    //[1] - потому что массив цен GBP под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.EUR.x = timestamps[2].map(timestamp => {              //[2] - потому что массив дат EUR под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        });
        this.charts.EUR.y = prices[2];                                    //[2] - потому что массив цен EUR под индексом 0

        // Отрисовываем график
        this.drawChart();

      } else if (this.periodType === "week") {


        // Н Е Д Е Л Я

        const weekData = await getWeekData();

        // Обрабатываем полученные данные
        const { usd, gbp, eur } = weekData;

        // Лупим данные в массивы для каждой валюты
        const prices = [usd, gbp, eur].map(array => array.map(item => item.price));
        const timestamps = [usd, gbp, eur].map(array => array.map(item => item.timestamp));

        // Засовываем в координаты данные по осям X и Y
        this.charts.USD.x = timestamps[0].map(timestamp => {              //[0] - потому что массив дат USD под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.USD.y = prices[0];                                    //[0] - потому что массив цен USD под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.GBP.x = timestamps[1].map(timestamp => {              //[1] - потому что массив дат GPB под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.GBP.y = prices[1];                                    //[1] - потому что массив цен GBP под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.EUR.x = timestamps[2].map(timestamp => {              //[2] - потому что массив дат EUR под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.EUR.y = prices[2];                                    //[2] - потому что массив цен EUR под индексом 0

        // Отрисовываем график
        this.drawChart();

      } else if (this.periodType === "month") {


        // М Е С Я Ц

        const monthData = await getMonthData();

        // Обрабатываем полученные данные
        const { usd, gbp, eur } = monthData;

        // Лупим данные в массивы для каждой валюты
        const prices = [usd, gbp, eur].map(array => array.map(item => item.price));
        const timestamps = [usd, gbp, eur].map(array => array.map(item => item.timestamp));

        // Засовываем в координаты данные по осям X и Y
        this.charts.USD.x = timestamps[0].map(timestamp => {              //[0] - потому что массив дат USD под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.USD.y = prices[0];                                    //[0] - потому что массив цен USD под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.GBP.x = timestamps[1].map(timestamp => {              //[1] - потому что массив дат GPB под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.GBP.y = prices[1];                                    //[1] - потому что массив цен GBP под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.EUR.x = timestamps[2].map(timestamp => {              //[2] - потому что массив дат EUR под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.EUR.y = prices[2];                                    //[2] - потому что массив цен EUR под индексом 0

        // Отрисовываем график
        this.drawChart();

      } else if (this.periodType === "year") {


        // Г О Д


        const yearData = await getYearData();

        // Обрабатываем полученные данные
        const { usd, gbp, eur } = yearData;

        // Лупим данные в массивы для каждой валюты
        const prices = [usd, gbp, eur].map(array => array.map(item => item.price));
        const timestamps = [usd, gbp, eur].map(array => array.map(item => item.timestamp));

        // Засовываем в координаты данные по осям X и Y
        this.charts.USD.x = timestamps[0].map(timestamp => {              //[0] - потому что массив дат USD под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.USD.y = prices[0];                                    //[0] - потому что массив цен USD под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.GBP.x = timestamps[1].map(timestamp => {              //[1] - потому что массив дат GPB под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.GBP.y = prices[1];                                    //[1] - потому что массив цен GBP под индексом 0

        // Засовываем в координаты данные по осям X и Y
        this.charts.EUR.x = timestamps[2].map(timestamp => {              //[2] - потому что массив дат EUR под индексом 0
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        });
        this.charts.EUR.y = prices[2];                                    //[2] - потому что массив цен EUR под индексом 0

        // Отрисовываем график
        this.drawChart();

      }
    }
  },
}
</script>