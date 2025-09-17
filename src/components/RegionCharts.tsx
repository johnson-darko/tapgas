import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const RegionPieChart = ({ data, label }: { data: { [key: string]: number }, label: string }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label,
        data: Object.values(data),
        backgroundColor: [
          '#38bdf8', '#22c55e', '#f59e42', '#f43f5e', '#a78bfa', '#fbbf24', '#0ea5e9', '#64748b', '#f472b6', '#34d399', '#f87171', '#818cf8', '#facc15', '#4ade80', '#f472b6', '#f87171', '#a3e635',
        ],
        borderWidth: 1,
      },
    ],
  };
  return <Pie data={chartData} />;
};

export const RegionBarChart = ({ data, label }: { data: { [key: string]: number }, label: string }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label,
        data: Object.values(data),
        backgroundColor: '#38bdf8',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: label },
    },
  };
  return <Bar data={chartData} options={options} />;
};
