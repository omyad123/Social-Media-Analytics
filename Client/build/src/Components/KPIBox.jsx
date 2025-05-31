

const KPIBox = ({ label, value, color = '#ccc' }) => {
  return (
  
     <div style={{
      borderRadius: '10px',
      paddingTop: '1rem',
      minWidth: '200px',
      height:"80px",
      flex: '1 0 200px',
      textAlign: 'center',
      // backgroundColor: `${color}`,
      backgroundColor: "15243e",
      boxShadow: "0 0px 10px #001027",
      display:"flex",
      color:"white !important",
      justifyContent:"center",
      alignItems:"center",
      // flexWrap:"wrap",
      width:"30px",
      flexDirection: "column"
      }}>
      <h4 style={{ marginBottom: '0.5rem', fontSize: '15px', color:"#ffffff8a" }}>{label}</h4>
      <p style={{ fontSize: '22px', fontWeight: 'bold', color:"#ffffff8a" }}>{value}</p>
    </div>
  );
};

export default KPIBox;
