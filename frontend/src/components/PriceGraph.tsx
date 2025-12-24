import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PriceGraphProps {
  data: Array<{
    date: string;
    price: number;
  }>;
}

const PriceGraph = ({ data }: PriceGraphProps) => {
  return (
    <div className="w-full h-64 mt-4">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">Price History</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`₹${value}`, "Price"]}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceGraph;
