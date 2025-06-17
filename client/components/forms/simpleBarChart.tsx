"use client"

import { BarChartData } from '@/types/types';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatLargeNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k';
  }
  return num.toString();
};

export default function simpleBarChart({values}: {values: BarChartData[]}) {
  return ( 
    <div className="w-full h-65 px-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={values}
        >
          <CartesianGrid stroke="#e0e0e0" vertical={false} />

          <XAxis
            dataKey="epoch"
            tickLine={false}
            axisLine={false}
            interval={5}
            tick={{ fill: '#6b7280', fontSize: 13 }}
            height={20}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280', fontSize: 13 }}
            tickFormatter={formatLargeNumber}
            width={20}
          />

          <Tooltip
            cursor={{ fill: '#E3E3E3', strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '0.75rem',
              border: '0px',
              padding: '0.75rem',
              boxShadow: '0 14px 50px rgba(3,36,67,0.1)'
            }}
            labelStyle={{ color: '#374151', fontWeight: 'bold', fontSize: 14 }}
            itemStyle={{ color: '#4b5563', fontSize: 13 }}
            labelFormatter={(label: string | number) => `Epoch: ${label}`}
            formatter={(value: number, name: string) => [`${value.toLocaleString()} Ada`]}
          />

          <Bar
            dataKey="reward"
            fill="#155dfc"
            name="Reward"
            barSize={35}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
