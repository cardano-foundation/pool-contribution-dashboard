/**
 * @file Draws a pie chart based on recharts
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { useTheme } from '@/app/context/themeContext';
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LegendProps } from 'recharts';
import styles from './simplePieChart.module.css';

/**
 * Interface for a single data point in the pie chart.
 * @interface PieChartData
 * @property {string} name - The name or label for the slice (e.g., stake range).
 * @property {number} value - The numerical value representing the size of the slice.
 */
interface PieChartData {
  name: string;
  value: number;
}


/**
 * Props for the SimplePieChart component.
 * @interface PieChartComponentProps
 * @property {PieChartData[]} data - An array of data points to be displayed in the pie chart.
 * @property {string} [title] - Optional title for the chart.
 * @property {string[]} [colors] - Optional array of hex color codes for the pie slices. Defaults to `DEFAULT_COLORS`.
 */
interface PieChartComponentProps {
  data: PieChartData[];
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#007FFF', '#00BFFF', '#00CC99', '#33CC33', '#0099CC', '#66CDAA', '#4682B4', '#20B2AA', '#006666'];

/**
 * Custom legend component for the Recharts PieChart.
 * It displays the name and color of each pie slice, adapting text color based on the current theme.
 *
 * @param {any} props - Props passed by Recharts to the custom legend component.
 * @returns {JSX.Element} A React component rendering a custom legend.
 */
const CustomLegend = (props: LegendProps) => {
  const { payload } = props;
  const { theme } = useTheme();

  const textColorClass = theme === "light" ? "text-gray-800" : "text-gray-200";

  return (

    <div className={`flex flex-col justify-center mt-4 text-sm ${textColorClass}`}>
      {payload && payload.map((entry, index: number) => (
        <div key={`legend-item-${index}`} className="flex items-center">
          <div
            className="w-3 h-3 rounded-sm mr-2 flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className={`${textColorClass} font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]`}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * A responsive pie chart component using Recharts, customizable with data, title, and colors.
 * It also adapts its appearance (e.g., tooltip cursor, tick styles) based on the application's theme.
 * Handles client-side rendering to prevent hydration mismatches.
 *
 * @param {PieChartComponentProps} { data, title, colors } - Props for the component.
 * @returns {JSX.Element} A React component rendering a pie chart.
 */
export default function SimplePieChart({ data, title, colors = DEFAULT_COLORS }: PieChartComponentProps) {

  const [isClient, setIsClient] = useState(false);

  const { theme } = useTheme();

  const cursorClass = theme === "light" ? styles.cursorLight : styles.cursorDark;

  //Change cursor stle depending on theme from themeContext
  const cursorStyle = {
    className: cursorClass,
    strokeWidth: 1
  }

  useEffect(() => {
    setIsClient(true);
  }, []);


  if (!data || data.length === 0) {
    return (
      <div className="w-full items-center h-[230px] justify-center">
        <p>No data found.</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="w-full items-center h-[230px] justify-center">
        {title && <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>}
        <div className="text-center text-gray-500">
          <p>Loading Diagramm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full items-center h-[230px] justify-center">
      {title && <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }} >
          <Pie
            isAnimationActive={false}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            cursor={cursorStyle}
            contentStyle={{
              backgroundColor: 'var(--recharts-tooltip-bg)',
              borderRadius: '0.75rem',
              border: '0px',
              padding: '0.75rem',
              boxShadow: '0 8px 10px rgba(3,36,67,0.2)'
            }}
            itemStyle={{ color: 'var(--recharts-tooltip-text-title)', fontWeight: 'medium', fontSize: 14 }}
            formatter={(value: string | number) => {

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 'bold' }}>{value}</span>
                </div>
              );
            }}
          />

          <Legend
            content={<CustomLegend />}
            layout="vertical"
            align="left"
            verticalAlign="middle"
            wrapperStyle={{

            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}