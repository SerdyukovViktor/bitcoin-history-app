import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
export function createChart(ctx, data, minYRounded) {
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.x,
      datasets: [{
        label: 'Данные по валюте',
        data: data.y,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointRadius: '0',

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
          min: minYRounded,
        }
      }
    }
  });

  return chart;
}