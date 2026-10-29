import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const LeaveDistributionChart = ({ data = [] }) => {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const chartData = data.length > 0 ? data.map((item) => ({
    name: item._id || item.name || 'Leave',
    value: item.totalDays || item.value || 0,
  })) : [
    { name: 'Casual Leave', value: 8 },
    { name: 'Sick Leave', value: 4 },
    { name: 'Earned Leave', value: 12 },
    { name: 'Unpaid Leave', value: 1 },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">Leave Type Distribution</h3>
        <p className="text-xs text-slate-500">Days consumed by leave category</p>
      </div>
      <div className="flex-1 w-full min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
              formatter={(val) => [`${val} Days`, 'Usage']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeaveDistributionChart;
