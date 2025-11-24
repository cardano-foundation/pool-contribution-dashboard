"use client"

import { RewardData } from '@/types/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function MyChart({values}: {values: RewardData[]}) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={values}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="reward" stroke="#BFA8FF" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
