// src/components/dashboard/Charts.jsx
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function PieChart({ data }) {
  const theme = useTheme();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: theme.palette.text.primary, // Warna label legend
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.grey[700],
        borderWidth: 1,
      },
      title: {
        display: false,
        text: 'Airdrop Status Distribution',
        color: theme.palette.text.primary,
      },
    },
  };
  return <Pie data={data} options={options} />;
}

export function BarChart({ data }) {
  const theme = useTheme();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.grey[700],
        borderWidth: 1,
      },
      title: {
        display: true,
        text: 'Airdrop Status Counts',
        color: theme.palette.text.primary,
      },
    },
    scales: {
      x: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.grey[800] }
      },
      y: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.grey[800] }
      },
    },
  };
  return <Bar data={data} options={options} />;
}