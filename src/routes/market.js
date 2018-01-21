import PlanetList from '../components/PlanetList/index';

function Market({ ...props }) {
  return (
    <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
      <h1 align="center">星星市场</h1>
      <PlanetList {...props}/>
    </div>
  );
}

export default Market;
