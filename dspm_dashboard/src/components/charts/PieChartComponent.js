import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PieChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export default PieChartComponent;