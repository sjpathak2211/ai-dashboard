import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  data: Array<{ name: string; progress: number }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={12}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#64748b" 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
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
        <Line 
          type="monotone" 
          dataKey="progress" 
          stroke="#00BCD4" 
          strokeWidth={3}
          dot={{ fill: '#00BCD4', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#00BCD4', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;