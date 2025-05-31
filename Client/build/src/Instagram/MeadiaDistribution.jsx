import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#CCCCCC'];

const MeadiaDistribution = ({ data }) => {
  // Format the data
  const formattedData = data.map((item, index) => ({
    ...item,
    percentage: parseFloat(item.percentage),
    color: COLORS[index % COLORS.length], 
    label: item.mediaType,
  }));

  const hasData = formattedData.length > 0;

  const displayData = hasData
    ? formattedData
    : [{ mediaType: 'No Data', percentage: 100, color: COLORS[4], label: 'No Data' }];

  return (
    <div 
      className="flex flex-col items-center" 
      style={{
        width: "50%",
        height: "420px",
        marginLeft: "30px",
        borderRadius:"8px",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"column",
        border:"1px solid grey",boxShadow:"0 0px 10px #001027"
      }}
    >
      <h5 className="text-md  mb-4 text-center mt-4" style={{color:"grey"}}>
        Media Distribution by Reach
      </h5>

      {/* Donut + Media types */}
      <div className="flex items-center justify-center" style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
        {/* Donut Chart */}
        <PieChart width={300} height={300}>
          <Pie
            data={displayData}
            dataKey="percentage"
            nameKey="mediaType"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            label
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>

        {/* Legend */}
        <div 
          className="d-flex p-4"
          style={{
            width: "100px",
            gap: "10px",
            flexWrap: 'wrap',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {displayData.map((item, index) => (
            <div key={index} className="text-[12px] font-medium text-white flex items-center" style={{width:"100px"}}>
              <span style={{ color: item.color, marginRight: '8px' }}>●</span> 
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* No data text */}
      {!hasData && (
        <div className="text-gray-600 mt-2 text-center">
          No Data Available for that filter
        </div>
      )}
    </div>
  );
};

export default MeadiaDistribution;
