/**
 * @file Draws a bar chart based on recharts
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

"use client"

import { BarChartData, ExchangeValue } from '@/types/types';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/app/context/currencyContext';
import { useTheme } from '@/app/context/themeContext';
import styles from './simpleBarChart.module.css';

/**
 * Props for the SimpleBarChart component.
 * @interface BarChartProps
 * @property {BarChartData[]} values - An array of data objects for the bar chart, each containing `epoch` and `reward`.
 * @property {ExchangeValue} exchangeRate - The current exchange rate, though it's noted as not directly used for display in the current formatter.
 */
interface BarChartProps {
  values: BarChartData[];
  exchangeRate: ExchangeValue;
}

const formatLargeNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k';
  }
  return num.toString();
};

/**
 * A responsive bar chart component that visualizes reward data per epoch.
 * It integrates with `useCurrency` and `useTheme` contexts to adapt its display
 * based on the selected currency (ADA or USD) and theme (light or dark).
 *
 * @param {BarChartProps} { values, exchangeRate } - Props for the component.
 * @returns {JSX.Element} A React component rendering a bar chart.
 */
export default function simpleBarChart({ values, exchangeRate }: BarChartProps) {

  const { currency } = useCurrency();
  const { theme } = useTheme();

  const customFormatter = (value: number) => {
    if (currency === "ada") {
      return [`${value.toLocaleString()} ₳`];
    } else {
      return [`${value.toLocaleString()} $`];
    }
  };

  const cursorClass = theme === "light" ? styles.cursorLight : styles.cursorDark;
  const tickClass = theme === "light" ? styles.tickLight : styles.tickDark;

  //Change cursor stle depending on theme from themeContext
  const cursorStyle = {
    className: cursorClass,
    strokeWidth: 1
  }

  const tickStyle = {
    className: tickClass,
    fontSize: 13
  }

  return (
    <div className="w-full h-65 px-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={values}
        >
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey="epoch"
            tickLine={false}
            axisLine={false}
            interval={"preserveEnd"}
            tick={tickStyle}
            height={20}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={tickStyle}
            tickFormatter={formatLargeNumber}
            width={20}
          />

          <Tooltip
            cursor={cursorStyle}
            contentStyle={{
              backgroundColor: 'var(--recharts-tooltip-bg)',
              borderRadius: '0.75rem',
              border: '0px',
              padding: '0.75rem',
              boxShadow: '0 8px 10px rgba(3,36,67,0.2)'
            }}
            labelStyle={{ color: 'var(--recharts-tooltip-text-title)', fontSize: 13 }}
            itemStyle={{ color: 'var(--recharts-tooltip-text)', fontWeight: 'bold', fontSize: 14 }}
            labelFormatter={(label: string | number) => `Epoch: ${label}`}
            formatter={customFormatter}
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
