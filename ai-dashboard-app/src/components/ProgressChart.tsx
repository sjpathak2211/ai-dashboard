import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProgressChartProps {
  data: Array<{ name: string; progress: number }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  // Color gradient based on progress
  const getBarColor = (progress: number) => {
    if (progress < 25) return '#ef4444'; // Red for low progress
    if (progress < 50) return '#f59e0b'; // Orange for medium-low progress
    if (progress < 75) return '#eab308'; // Yellow for medium progress
    return '#10b981'; // Green for high progress
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={12}
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="#64748b" 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [`${value}%`, 'Progress']}
        />
        <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.progress)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;