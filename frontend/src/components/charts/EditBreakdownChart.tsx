import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { chartColors } from '../../utils/colors';
import { formatMinutes } from '../../utils/formatters';

interface EditBreakdownChartProps {
  data: { type: string; count: number; percentage: number; avgMinutes: number }[];
  height?: number;
}

export function EditBreakdownChart({ data, height = 220 }: EditBreakdownChartProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Edits by Type</h3>
      <p className="text-xs text-slate-500 mb-3">Where manual work is required</p>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value, name) => {
              const item = data.find(d => d.type === name);
              return [
                `${value} edits (${item?.percentage}%) · ~${formatMinutes(item?.avgMinutes || 0)} each`,
                String(name)
              ];
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
